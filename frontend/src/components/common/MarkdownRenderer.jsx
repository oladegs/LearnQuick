import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { PrismLight as SyntaxHighlighter } from "react-syntax-highlighter";
import bash from "react-syntax-highlighter/dist/esm/languages/prism/bash";
import css from "react-syntax-highlighter/dist/esm/languages/prism/css";
import javascript from "react-syntax-highlighter/dist/esm/languages/prism/javascript";
import json from "react-syntax-highlighter/dist/esm/languages/prism/json";
import jsx from "react-syntax-highlighter/dist/esm/languages/prism/jsx";
import markup from "react-syntax-highlighter/dist/esm/languages/prism/markup";
import python from "react-syntax-highlighter/dist/esm/languages/prism/python";
import { dracula } from "react-syntax-highlighter/dist/esm/styles/prism";

const supportedLanguages = {
  bash,
  css,
  html: markup,
  javascript,
  js: javascript,
  json,
  jsx,
  markup,
  python,
  py: python,
};

Object.entries(supportedLanguages).forEach(([name, language]) => {
  SyntaxHighlighter.registerLanguage(name, language);
});

const MarkdownRenderer = ({ content = "" }) => {
  const safeContent = typeof content === "string" ? content : String(content || "");

  return (
    <div className="text-slate-300">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ _node, ...props }) => <h1 className="text-xl font-bold mt-4 mb-2" {...props} />,
          h2: ({ _node, ...props }) => <h2 className="text-lg font-bold mt-4 mb-2" {...props} />,
          h3: ({ _node, ...props }) => <h3 className="text-md font-bold mt-3 mb-2" {...props} />,
          h4: ({ _node, ...props }) => <h4 className="text-sm font-bold mt-1 mb-1" {...props} />,
          p: ({ _node, ...props }) => <p className="mb-2 leading-relaxed" {...props} />,
          a: ({ _node, ...props }) => <a className="text-sky-300 hover:text-sky-200 hover:underline" {...props} />,
          ul: ({ _node, ...props }) => <ul className="list-disc list-inside mb-2 ml-4" {...props} />,
          ol: ({ _node, ...props }) => <ol className="list-decimal list-inside mb-2 ml-4" {...props} />,
          li: ({ _node, ...props }) => <li className="mb-1" {...props} />,
          strong: ({ _node, ...props }) => <strong className="font-bold" {...props} />,
          em: ({ _node, ...props }) => <em className="italic" {...props} />,
          blockquote: ({ _node, ...props }) => (
            <blockquote className="my-4 border-l-4 border-sky-400/50 pl-4 italic text-slate-400" {...props} />
          ),
          code: ({ _node, inline, className, children, ...props }) => {
            const match = /language-(\w+)/.exec(className || "");
            const language = match?.[1]?.toLowerCase();

            return !inline && language && supportedLanguages[language] ? (
              <SyntaxHighlighter
                style={dracula}
                language={language}
                PreTag="div"
                {...props}
              >
                {String(children).replace(/\n$/, "")}
              </SyntaxHighlighter>
            ) : (
              <code className="rounded bg-white/10 p-1 font-mono text-sm text-sky-100" {...props}>
                {children}
              </code>
            );
          },
          pre: ({ _node, ...props }) => <pre className="bg-neutral-800 text-white p-3 rounded-md
          overflow-x-auto font-mono text-sm " {...props} />,
        }}
      >
        {safeContent}
      </ReactMarkdown>
    </div>
  );
};

export default MarkdownRenderer;
