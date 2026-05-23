package tokens

import (
	"testing"
	"time"
)

func TestMintForSessionAndVerify(t *testing.T) {
	issuer, err := NewIssuer(Config{
		Issuer:    "https://auth.test",
		Audience:  "next-test",
		AccessTTL: time.Minute,
	})
	if err != nil {
		t.Fatalf("NewIssuer: %v", err)
	}

	token, expiresAt, err := issuer.MintForSession("user-1", "session-1", "creator")
	if err != nil {
		t.Fatalf("MintForSession: %v", err)
	}
	if token == "" {
		t.Fatal("token is empty")
	}
	if time.Until(expiresAt) <= 0 {
		t.Fatalf("expires_at is not in the future: %s", expiresAt)
	}

	claims, err := issuer.Verify(token)
	if err != nil {
		t.Fatalf("Verify: %v", err)
	}
	if claims.Subject != "user-1" {
		t.Fatalf("subject = %q, want user-1", claims.Subject)
	}
	if claims.SessionID != "session-1" {
		t.Fatalf("sid = %q, want session-1", claims.SessionID)
	}
	if claims.Next.Handle != "creator" {
		t.Fatalf("handle = %q, want creator", claims.Next.Handle)
	}
	if claims.Next.Tier != "authenticated" {
		t.Fatalf("tier = %q, want authenticated", claims.Next.Tier)
	}
}

func TestVerifyRejectsMalformedToken(t *testing.T) {
	issuer, err := NewIssuer(Config{Issuer: "https://auth.test", Audience: "next-test"})
	if err != nil {
		t.Fatalf("NewIssuer: %v", err)
	}

	if _, err := issuer.Verify("not-a-token"); err == nil {
		t.Fatal("Verify succeeded for malformed token")
	}
}
