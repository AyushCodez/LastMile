package com.imt.lastmile.user.domain;

import java.util.UUID;

public class User {
  public enum Role { RIDER, DRIVER }
  private final String id;
  private String name;
  private String email;
  private String password; // plaintext for demo ONLY
  private Role role;

  public User(String name, String email, String password, Role role) {
    this.id = UUID.randomUUID().toString();
    this.name = name;
    this.email = email;
    this.password = password;
    this.role = role;
  }
  public String getId() { return id; }
  public String getName() { return name; }
  public void setName(String name) { this.name = name; }
  public String getEmail() { return email; }
  public void setEmail(String email) { this.email = email; }
  public String getPassword() { return password; }
  public void setPassword(String password) { this.password = password; }
  public Role getRole() { return role; }
  public void setRole(Role role) { this.role = role; }
}
