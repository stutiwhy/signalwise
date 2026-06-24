import ReactMarkdown from "react-markdown";

export function Markdown({ children }: { children: string }) {
  return (
    <ReactMarkdown
      components={{
        p: ({ children }) => (
          <p className="mb-5 text-[1.05rem] leading-8 text-foreground">
            {children}
          </p>
        ),

        ul: ({ children }) => (
          <ul className="list-disc pl-6 mb-5 space-y-2 text-[1.05rem] leading-8">
            {children}
          </ul>
        ),

        ol: ({ children }) => (
          <ol className="list-decimal pl-6 mb-5 space-y-2 text-[1.05rem] leading-8">
            {children}
          </ol>
        ),

        li: ({ children }) => (
          <li className="text-muted-foreground">
            {children}
          </li>
        ),

        strong: ({ children }) => (
          <strong className="font-semibold text-foreground">
            {children}
          </strong>
        ),

        h1: ({ children }) => (
          <h1 className="text-4xl font-semibold mb-5 mt-8 text-foreground">
            {children}
          </h1>
        ),

        h2: ({ children }) => (
          <h2 className="text-3xl font-semibold mb-4 mt-8 text-foreground">
            {children}
          </h2>
        ),

        h3: ({ children }) => (
          <h3 className="text-xl font-semibold mb-3 mt-7 text-foreground">
            {children}
          </h3>
        ),

        h4: ({ children }) => (
          <h4 className="text-lg font-medium mb-2 mt-6 text-foreground">
            {children}
          </h4>
        ),

        blockquote: ({ children }) => (
          <blockquote className="border-l-4 border-primary pl-5 italic my-6 text-muted-foreground">
            {children}
          </blockquote>
        ),

        hr: () => (
          <hr className="my-8 border-border" />
        ),
      }}
    >
      {children}
    </ReactMarkdown>
  );
}