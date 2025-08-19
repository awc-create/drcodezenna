// src/emails/WelcomeEmail.tsx
import * as React from 'react';

type Props = {
  name?: string;
  logoUrl: string;          // e.g. https://your-site.com/assets/drcode-logo.png
  unsubscribeUrl?: string;
};

export default function WelcomeEmail({ name = 'there', logoUrl, unsubscribeUrl }: Props) {
  const wrap: React.CSSProperties = { margin:0, padding:0, background:'#f5f5f5', fontFamily:'Georgia, serif' };
  const card: React.CSSProperties = { maxWidth:680, margin:'0 auto', background:'#fff', padding:24, border:'1px solid #e6e6e6' };
  const hrBold: React.CSSProperties = { border:0, borderTop:'2px solid #111', margin:'14px 0' };
  const hrDot: React.CSSProperties  = { border:0, borderTop:'1px dotted #999', margin:'18px 0' };
  const h1: React.CSSProperties     = { margin:'8px 0 0', fontSize:36, lineHeight:1.1, letterSpacing:'0.5px', textAlign:'center' };
  const sub: React.CSSProperties    = { textAlign:'center', color:'#666', marginTop:6, marginBottom:10, fontSize:14 };
  const p: React.CSSProperties      = { fontSize:16, lineHeight:1.5, margin:'10px 0' };
  const footer: React.CSSProperties = { textAlign:'center', color:'#666', fontSize:12, marginTop:16 };

  return (
    <div style={wrap}>
      <table width="100%" cellPadding={0} cellSpacing={0} role="presentation">
        <tbody>
          <tr>
            <td>
              <div style={{ height: 18 }} />
              <div style={card}>
                {/* Logo */}
                <div style={{ textAlign: 'center' }}>
                  <img
                    src={logoUrl}
                    alt="Dr Code logo"
                    width="90"
                    height="90"
                    style={{ display:'inline-block', border:0, outline:'none' }}
                  />
                </div>

                {/* Masthead */}
                <hr style={hrBold} />
                <h1 style={h1}>The Code Times</h1>
                <div style={sub}>Welcome to the newsletter</div>
                <hr style={hrBold} />

                {/* Body */}
                <p style={p}>Hi {name},</p>
                <p style={p}>
                  Thanks for subscribing! You’ll get occasional updates on new blog posts,
                  teaching notes, and announcements — laid out like a tidy little newspaper.
                </p>
                <p style={p}>
                  While you wait, feel free to browse recent articles and teaching posts on the site.
                  I’m glad you’re here.
                </p>
                <p style={p}>— Dr. Odera Ezenna</p>

                {/* Newspaper divider */}
                <hr style={hrDot} />

                <p style={{ ...p, color:'#666', fontSize:14 }}>
                  You can update your interests or unsubscribe at any time.
                </p>

                {/* Footer */}
                {unsubscribeUrl ? (
                  <p style={footer}>
                    Don’t want these emails?{' '}
                    <a href={unsubscribeUrl} target="_blank" rel="noopener noreferrer" style={{ color:'#666' }}>
                      Unsubscribe
                    </a>
                  </p>
                ) : null}
              </div>
              <div style={{ height: 18 }} />
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
