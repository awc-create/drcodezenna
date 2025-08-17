// src/emails/WeeklyDigestEmail.tsx
import * as React from 'react';

export type DigestItem = { title: string; url: string };

type Props = {
  logoUrl: string;                 // absolute URL to your logo
  headline?: string;               // defaults to "The Code Times"
  introMessage: string;            // custom message typed in admin
  weekLabel?: string;              // e.g., "Week of Sep 1–7" or "September 2025"
  blogPosts?: DigestItem[];        // selected blog posts
  teachingPosts?: DigestItem[];    // selected teaching posts
  unsubscribeUrl?: string;         // optional, but recommended
};

export default function WeeklyDigestEmail({
  logoUrl,
  headline = 'The Code Times',
  introMessage,
  weekLabel,
  blogPosts = [],
  teachingPosts = [],
  unsubscribeUrl,
}: Props) {
  const wrap: React.CSSProperties = { margin:0, padding:0, background:'#f5f5f5', fontFamily:'Georgia, serif' };
  const card: React.CSSProperties = { maxWidth:680, margin:'0 auto', background:'#fff', padding:24, border:'1px solid #e6e6e6' };
  const hrBold: React.CSSProperties = { border:0, borderTop:'2px solid #111', margin:'14px 0' };
  const hrDot: React.CSSProperties  = { border:0, borderTop:'1px dotted #999', margin:'18px 0' };
  const h1: React.CSSProperties     = { margin:'8px 0 0', fontSize:36, lineHeight:1.1, letterSpacing:'0.5px', textAlign:'center' };
  const sub: React.CSSProperties    = { textAlign:'center', color:'#666', marginTop:6, marginBottom:10, fontSize:14 };
  const sectionTitle: React.CSSProperties = { fontSize:18, margin:'0 0 8px' };
  const li: React.CSSProperties     = { marginBottom:8, lineHeight:1.4, fontSize:15 };
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
                <h1 style={h1}>{headline}</h1>
                <div style={sub}>{weekLabel ?? ''}</div>
                <hr style={hrBold} />

                {/* Intro */}
                <p style={{ fontSize: 16, marginTop: 14 }}>{introMessage}</p>

                {/* Blog */}
                <hr style={hrDot} />
                <h3 style={sectionTitle}>
                  Blog posts released {weekLabel?.toLowerCase().includes('week') ? 'this week' : 'in this period'}
                </h3>
                {blogPosts.length ? (
                  <ul style={{ paddingLeft: 18, marginTop: 6, marginBottom: 0 }}>
                    {blogPosts.map((p, i) => (
                      <li key={`b-${i}`} style={li}>
                        <a href={p.url} target="_blank" rel="noopener noreferrer" style={{ color:'#111', textDecoration:'underline' }}>
                          {p.title}
                        </a>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p style={{ color:'#666', fontSize:14, marginTop:6 }}>
                    No new blog posts in this period.
                  </p>
                )}

                {/* Teaching */}
                <hr style={hrDot} />
                <h3 style={sectionTitle}>
                  New teaching released {weekLabel?.toLowerCase().includes('week') ? 'this week' : 'in this period'}
                </h3>
                {teachingPosts.length ? (
                  <ul style={{ paddingLeft: 18, marginTop: 6, marginBottom: 0 }}>
                    {teachingPosts.map((p, i) => (
                      <li key={`t-${i}`} style={li}>
                        <a href={p.url} target="_blank" rel="noopener noreferrer" style={{ color:'#111', textDecoration:'underline' }}>
                          {p.title}
                        </a>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p style={{ color:'#666', fontSize:14, marginTop:6 }}>
                    No teaching updates in this period.
                  </p>
                )}

                {/* Footer */}
                <hr style={hrDot} />
                <p style={{ fontSize: 14, marginTop: 10 }}>— Dr. Odera Ezenna</p>
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
