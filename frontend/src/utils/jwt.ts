export interface DecodedToken {
    sub: string; // userId
    role: string;
    exp: number;
}

export const decodeToken = (token: string): DecodedToken | null => {
    try {
        if (!token || !token.includes('.')) return null;
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(
            atob(base64)
                .split('')
                .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                .join('')
        );
        return JSON.parse(jsonPayload);
    } catch (e) {
        console.error('Failed to decode token', e);
        return null;
    }
};
