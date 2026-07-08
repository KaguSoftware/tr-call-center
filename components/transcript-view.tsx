// Highlights the speaker label at the start of each transcript line (e.g.
// "Müşteri:" / "Temsilci:") so it's easy to track who's talking while
// scanning down the text. Falls back to plain text for lines with no label.
const SPEAKER_LABEL = /^([^:\n]{1,30}:)(\s*)/;

export function TranscriptView({ transcript }: { transcript: string }) {
  return (
    <>
      {transcript.split("\n").map((line, i) => {
        const match = line.match(SPEAKER_LABEL);
        if (!match) return <div key={i}>{line || " "}</div>;
        const [, label, space] = match;
        const rest = line.slice(match[0].length);
        return (
          <div key={i}>
            <span className="text-blue-600 font-medium">{label}</span>
            {space}
            {rest}
          </div>
        );
      })}
    </>
  );
}
