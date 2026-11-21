import Image from "next/image";

export default function Home() {
  return (
    <main className="starter-page">
      <div className="starter-content">
        <Image
          className="next-logo"
          src="/next.svg"
          alt="Next.js logo"
          width={180}
          height={38}
          priority
        />
        <ol>
          <li>
            Get started by editing <code>app/page.tsx</code>.
          </li>
          <li>Save and see your changes instantly.</li>
        </ol>

        <div className="starter-actions">
          <a className="primary-link" href="https://vercel.com/new" target="_blank" rel="noopener noreferrer">
            Deploy now
          </a>
          <a className="secondary-link" href="https://nextjs.org/docs" target="_blank" rel="noopener noreferrer">
            Read our docs
          </a>
        </div>
      </div>

      <footer className="starter-footer">
        <a href="https://nextjs.org/learn" target="_blank" rel="noopener noreferrer">
          Learn <span aria-hidden="true">↗</span>
        </a>
        <a href="https://vercel.com/templates" target="_blank" rel="noopener noreferrer">
          Examples <span aria-hidden="true">↗</span>
        </a>
        <a href="https://nextjs.org" target="_blank" rel="noopener noreferrer">
          Go to nextjs.org <span aria-hidden="true">↗</span>
        </a>
      </footer>
    </main>
  );
}
