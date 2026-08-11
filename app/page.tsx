import Link from 'next/link';
import { ArrowRight, Download, MousePointer2, Sparkles, Volume2, Search } from 'lucide-react';

export default function HomePage() {
  return (
    <>
      <section className="hero section-pad">
        <div className="hero-copy">
          <span className="eyebrow"><Sparkles size={15}/> Built for Speech Pathology teaching</span>
          <h1>Build phoneme activities your students can <span>see, explore and play.</span></h1>
          <p>Create classroom-ready Wordle and Word Search activities with phoneme-first interaction, live preview and one-click standalone HTML export.</p>
          <div className="hero-actions">
            <Link className="btn primary" href="/wordle">Build a Wordle <ArrowRight size={18}/></Link>
            <Link className="btn secondary" href="/word-search">Create Word Search</Link>
          </div>
          <div className="trust-row">
            <span><MousePointer2 size={17}/> Hover phoneme hints</span>
            <span><Download size={17}/> Offline HTML export</span>
            <span><Volume2 size={17}/> Phoneme-first design</span>
          </div>
        </div>
        <div className="hero-preview" aria-label="Product preview">
          <div className="preview-window">
            <div className="window-bar"><span/><span/><span/><b>Live Preview</b></div>
            <div className="preview-body">
              <div className="mini-badge">WORDLE · 3 PHONEMES</div>
              <h3>Find the phoneme word</h3>
              <div className="tile-row"><div className="tile correct">θ</div><div className="tile present">ɪ</div><div className="tile">n</div></div>
              <div className="phoneme-hint"><b>/θ/</b><span>TH (as in thin)</span></div>
              <div className="keyboard-row"><kbd>θ</kbd><kbd>ð</kbd><kbd>ʃ</kbd><kbd>tʃ</kbd><kbd>ɪ</kbd></div>
            </div>
          </div>
        </div>
      </section>

      <section className="section-pad features-section">
        <div className="section-heading"><span className="eyebrow">Two focused tools</span><h2>One builder. Two classroom formats.</h2><p>Designed to keep configuration simple for teachers while making the student-facing activity clear and engaging.</p></div>
        <div className="feature-grid">
          <article className="feature-card accent-a"><div className="icon-box"><Volume2/></div><h3>Phoneme Wordle</h3><p>Create a single phoneme-based target word with familiar Wordle feedback and phonetic hints.</p><Link href="/wordle">Open builder <ArrowRight size={16}/></Link></article>
          <article className="feature-card accent-b"><div className="icon-box"><Search/></div><h3>Phoneme Word Search</h3><p>Generate a classroom puzzle from a compact phoneme word list with selectable cells and answer reveal.</p><Link href="/word-search">Open builder <ArrowRight size={16}/></Link></article>
          <article className="feature-card"><div className="icon-box"><Download/></div><h3>Standalone HTML</h3><p>Export the configured activity as one playable HTML file that opens in a normal browser without the builder.</p><span className="muted-link">No database required</span></article>
        </div>
      </section>
    </>
  );
}
