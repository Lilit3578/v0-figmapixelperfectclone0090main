import React from 'react';

interface NotesTextareaProps {
  value: string;
  onChange: (value: string) => void;
}

const NotesTextarea: React.FC<NotesTextareaProps> = ({ value, onChange }) => {
  return (
    <div className="flex h-full items-start gap-2.5 flex-[1_0_0] self-stretch rounded border box-border bg-white p-4 border-solid border-[rgba(31,31,31,0.12)] max-sm:p-3">
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="add notes to remember what you worked on during this sprint (e.g. design logo, ...)"
        className="flex-[1_0_0] h-full overflow-auto text-[rgba(31,31,31,0.64)] text-sm font-light leading-[23.8px] bg-transparent border-none outline-none resize-none placeholder:text-[rgba(31,31,31,0.64)]"
        aria-label="Sprint notes"
      />
    </div>
  );
};

export default NotesTextarea;
