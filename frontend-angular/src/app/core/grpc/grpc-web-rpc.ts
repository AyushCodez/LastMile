import { GrpcWebClientBase, MethodDescriptor } from 'grpc-web';
import { Observable, Subject } from 'rxjs';

export interface Rpc {
    request(service: string, method: string, data: Uint8Array): Promise<Uint8Array>;
    clientStreamingRequest(service: string, method: string, data: Observable<Uint8Array>): Promise<Uint8Array>;
    serverStreamingRequest(service: string, method: string, data: Uint8Array): Observable<Uint8Array>;
    bidirectionalStreamingRequest(service: string, method: string, data: Observable<Uint8Array>): Observable<Uint8Array>;
}

export class GrpcWebRpc implements Rpc {
    private client = new GrpcWebClientBase({});

    constructor(private host: string) { }

    request(service: string, method: string, data: Uint8Array): Promise<Uint8Array> {
        return new Promise((resolve, reject) => {
            const metadata: { [key: string]: string } = {};
            const token = localStorage.getItem('auth_token'); // Matches AuthService.TOKEN_KEY
            if (token) {
                metadata['Authorization'] = `Bearer ${token}`;
            }

            this.client.rpcCall(
                `${this.host}/${service}/${method}`,
                data,
                metadata,
                new MethodDescriptor(
                    `${service}/${method}`,
                    'unary',
                    Object,
                    Object,
                    (req: Uint8Array) => req,
                    (res: Uint8Array) => res,
                ),
                (err: any, response: Uint8Array) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(response);
                    }
                }
            );
        });
    }

    clientStreamingRequest(service: string, method: string, data: Observable<Uint8Array>): Promise<Uint8Array> {
        throw new Error('Client streaming not supported in grpc-web');
    }

    serverStreamingRequest(service: string, method: string, data: Uint8Array): Observable<Uint8Array> {
        const metadata: { [key: string]: string } = {};
        const token = localStorage.getItem('auth_token');
        if (token) {
            metadata['Authorization'] = `Bearer ${token}`;
        }

        return new Observable((observer) => {
            const stream: any = this.client.serverStreaming(
                `${this.host}/${service}/${method}`,
                data,
                metadata,
                new MethodDescriptor(
                    `${service}/${method}`,
                    'server_streaming',
                    Object,
                    Object,
                    (req: Uint8Array) => req,
                    (res: Uint8Array) => res,
                )
            );

            stream.on('data', (response: Uint8Array) => {
                observer.next(response);
            });

            stream.on('error', (err: any) => {
                observer.error(err);
            });

            stream.on('end', () => {
                observer.complete();
            });

            return () => {
                stream.cancel();
            };
        });
    }

    bidirectionalStreamingRequest(service: string, method: string, data: Observable<Uint8Array>): Observable<Uint8Array> {
        throw new Error('Bidirectional streaming not supported in grpc-web');
    }
}
