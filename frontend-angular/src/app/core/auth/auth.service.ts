import { Injectable } from '@angular/core';
import { UserServiceClient } from '../../../proto/user_pb_service';
import { Credentials, AuthResponse, CreateUserRequest, CreateUserResponse, UserProfile } from '../../../proto/user_pb';
import { UserId } from '../../../proto/common_pb';
import { BehaviorSubject, Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { grpc } from '@improbable-eng/grpc-web';

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    private readonly TOKEN_KEY = 'auth_token';
    private readonly USER_ID_KEY = 'user_id';
    private readonly ROLE_KEY = 'user_role';

    private isAuthenticatedSubject = new BehaviorSubject<boolean>(this.hasToken());
    public isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

    constructor(private userServiceClient: UserServiceClient) { }

    private hasToken(): boolean {
        return !!localStorage.getItem(this.TOKEN_KEY);
    }

    getToken(): string | null {
        return localStorage.getItem(this.TOKEN_KEY);
    }

    getUserId(): string | null {
        return localStorage.getItem(this.USER_ID_KEY);
    }

    getUserRole(): string | null {
        return localStorage.getItem(this.ROLE_KEY);
    }

    getMetadata(): grpc.Metadata {
        const token = this.getToken();
        const metadata = new grpc.Metadata();
        if (token) {
            metadata.append('Authorization', `Bearer ${token}`);
        }
        return metadata;
    }

    getUserProfile(): Observable<UserProfile.AsObject> {
        const userIdStr = this.getUserId();
        if (!userIdStr) throw new Error('User ID not found');

        const req = new UserId();
        req.setId(userIdStr);

        return new Observable<UserProfile>((observer) => {
            this.userServiceClient.getUser(req, this.getMetadata(), (err, res) => {
                if (err) observer.error(err);
                else if (res) {
                    observer.next(res);
                    observer.complete();
                }
            });
        }).pipe(map(res => res.toObject()));
    }

    login(email: string, password: string): Observable<AuthResponse.AsObject> {
        const req = new Credentials();
        req.setEmail(email);
        req.setPassword(password);

        return new Observable<AuthResponse>((observer) => {
            this.userServiceClient.authenticate(req, (err, response) => {
                if (err) {
                    observer.error(err);
                } else if (response) {
                    observer.next(response);
                    observer.complete();
                }
            });
        }).pipe(
            map(res => res.toObject()),
            tap(res => {
                if (!res.jwt || res.jwt === 'INVALID') {
                    throw new Error('Invalid credentials');
                }
                localStorage.setItem(this.TOKEN_KEY, res.jwt);
                this.isAuthenticatedSubject.next(true);
                this.decodeToken(res.jwt);
            })
        );
    }

    signup(req: CreateUserRequest): Observable<CreateUserResponse.AsObject> {
        return new Observable<CreateUserResponse>((observer) => {
            this.userServiceClient.createUser(req, (err, response) => {
                if (err) {
                    observer.error(err);
                } else if (response) {
                    observer.next(response);
                    observer.complete();
                }
            });
        }).pipe(map(res => res.toObject()));
    }

    logout() {
        localStorage.removeItem(this.TOKEN_KEY);
        localStorage.removeItem(this.USER_ID_KEY);
        localStorage.removeItem(this.ROLE_KEY);
        this.isAuthenticatedSubject.next(false);
    }

    private decodeToken(token: string) {
        if (!token || token.split('.').length < 2) {
            return;
        }
        try {
            const base64Url = token.split('.')[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const jsonPayload = decodeURIComponent(atob(base64).split('').map(function (c) {
                return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
            }).join(''));

            const payload = JSON.parse(jsonPayload);
            if (payload.sub) {
                localStorage.setItem(this.USER_ID_KEY, payload.sub);
            }
            if (payload.role) {
                localStorage.setItem(this.ROLE_KEY, payload.role);
            }
        } catch (e) {
            console.error('Failed to decode token', e);
        }
    }
}
