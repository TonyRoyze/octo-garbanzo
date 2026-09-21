package com.reciptile.api.auth;

public record AuthResponse(String token, UserView user) {
    public record UserView(String id, String name, String email, String location,
            BrowserLocation browserLocation, UserRole role) {
        public static UserView from(AppUser user) {
            return new UserView(user.getId(), user.getName(), user.getEmail(), user.getLocation(),
                    user.getBrowserLocation(), user.getRole());
        }
    }
}
