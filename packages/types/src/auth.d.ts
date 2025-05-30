export interface AuthUser {
    id: string;
    email: string;
    name: string;
    avatar_url?: string;
    roles: AuthUserRole[];
    permissions: AuthPermission[];
    subscription_tier: string;
}
export type AuthUserRole = 'admin' | 'user' | 'moderator';
export interface AuthPermission {
    resource: string;
    actions: string[];
}
export interface AuthJWTPayload {
    sub: string;
    email: string;
    name: string;
    roles: AuthUserRole[];
    iat: number;
    exp: number;
}
export interface AuthTokens {
    access_token: string;
    refresh_token: string;
    expires_in: number;
    token_type: 'Bearer';
}
export interface AuthLoginRequest {
    email: string;
    password: string;
}
export interface AuthRegisterRequest {
    email: string;
    password: string;
    name: string;
}
export interface AuthRefreshTokenRequest {
    refresh_token: string;
}
export interface AuthPasswordResetRequest {
    email: string;
}
export interface AuthPasswordUpdateRequest {
    current_password: string;
    new_password: string;
}
//# sourceMappingURL=auth.d.ts.map