import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { setCookie, getCookie, eraseCookie, saveCookiePreferences, getCookiePreferences, getAuditLog, clearAuditLog } from '../lib/cookieUtils';

describe('Cookie Utilities', () => {
  beforeEach(() => {
    // Clear cookies and local storage before each test
    document.cookie.split(";").forEach(function(c) { 
      document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/"); 
    });
    localStorage.clear();
  });

  it('should set and get a cookie', () => {
    setCookie('testCookie', 'testValue');
    expect(getCookie('testCookie')).toBe('testValue');
  });

  it('should erase a cookie', () => {
    setCookie('testCookie', 'testValue');
    eraseCookie('testCookie');
    expect(getCookie('testCookie')).toBeNull();
  });

  it('should save and retrieve cookie preferences', () => {
    const prefs = { essential: true, analytics: false, marketing: true };
    saveCookiePreferences(prefs);
    
    const retrieved = getCookiePreferences();
    expect(retrieved.preferences).toEqual(prefs);
    expect(retrieved.timestamp).toBeDefined();
  });

  it('should log actions to the audit log', () => {
    clearAuditLog();
    setCookie('auditTest', 'value');
    
    const log = getAuditLog();
    expect(log.length).toBeGreaterThan(0);
    expect(log[0].action).toBe('SET');
    expect(log[0].target).toBe('auditTest');
  });

  it('should clear the audit log', () => {
    setCookie('auditTest', 'value');
    clearAuditLog();
    const log = getAuditLog();
    expect(log.length).toBe(0);
  });
});
