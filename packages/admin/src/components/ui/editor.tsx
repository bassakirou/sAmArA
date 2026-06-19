import cn from 'classnames';
import React, {
  TextareaHTMLAttributes,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

export interface Props extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  className?: string;
  inputClassName?: string;
  label?: string;
  note?: string;
  name: string;
  error?: string;
  shadow?: boolean;
  variant?: 'normal' | 'solid' | 'outline';
  disabled?: boolean;
}

const classes = {
  wrapper:
    'rounded border transition duration-300 ease-in-out text-sm text-heading',
  normal: 'bg-gray-100 border-border-base focus-within:border-accent',
  solid: 'bg-gray-100 border-border-100 focus-within:border-accent',
  outline: 'border-border-base bg-light focus-within:border-accent',
  shadow: 'focus-within:shadow',
  toolbar:
    'flex flex-wrap items-center gap-2 border-b border-border-base px-3 py-2',
  toolbarButton:
    'min-w-[2rem] rounded border border-border-base px-2 py-1 text-xs font-semibold text-body transition hover:border-accent hover:text-accent focus:outline-none focus:ring-0',
  toolbarButtonActive: 'border-accent bg-accent/10 text-accent',
  editor:
    'min-h-[7rem] w-full px-4 py-3 text-sm text-heading focus:outline-none',
};

type SupportedCommand =
  | 'bold'
  | 'italic'
  | 'underline'
  | 'insertUnorderedList'
  | 'insertOrderedList';

type ToolbarItem = {
  command: SupportedCommand;
  label: string;
  title: string;
};

const TOOLBAR_ITEMS: ToolbarItem[] = [
  { command: 'bold', label: 'B', title: 'Bold' },
  { command: 'italic', label: 'I', title: 'Italic' },
  { command: 'underline', label: 'U', title: 'Underline' },
  { command: 'insertUnorderedList', label: 'UL', title: 'Unordered list' },
  { command: 'insertOrderedList', label: 'OL', title: 'Ordered list' },
];

function assignRef<T>(ref: React.Ref<T> | undefined, value: T) {
  if (!ref) return;
  if (typeof ref === 'function') {
    ref(value);
    return;
  }
  (ref as React.MutableRefObject<T>).current = value;
}

function isEmptyHtml(value: string) {
  const withoutTags = value
    .replace(/<br\s*\/?>/gi, '')
    .replace(/&nbsp;/gi, '')
    .replace(/<[^>]*>/g, '')
    .trim();
  return withoutTags.length === 0;
}

function normalizeHtml(value: string) {
  return isEmptyHtml(value) ? '' : value;
}

const Editor = React.forwardRef<HTMLTextAreaElement, Props>((props, ref) => {
  const {
    className,
    label,
    note,
    name,
    error,
    variant = 'normal',
    shadow = false,
    inputClassName,
    disabled,
    onChange,
    onBlur,
    placeholder,
    rows = 4,
    defaultValue,
    value,
    ...rest
  } = props;

  const hiddenTextareaRef = useRef<HTMLTextAreaElement | null>(null);
  const editorRef = useRef<HTMLDivElement | null>(null);
  const [html, setHtml] = useState('');
  const [activeCommands, setActiveCommands] = useState<SupportedCommand[]>([]);

  const rootClassName = cn(
    classes.wrapper,
    {
      [classes.normal]: variant === 'normal',
      [classes.solid]: variant === 'solid',
      [classes.outline]: variant === 'outline',
    },
    {
      [classes.shadow]: shadow,
    },
    disabled && 'cursor-not-allowed border-[#D4D8DD] bg-[#EEF1F4]',
    inputClassName
  );

  const syncEditorContent = useCallback((nextValue: string) => {
    const normalized = normalizeHtml(nextValue);
    setHtml(normalized);
    if (editorRef.current && editorRef.current.innerHTML !== normalized) {
      editorRef.current.innerHTML = normalized;
    }
    if (hiddenTextareaRef.current && hiddenTextareaRef.current.value !== normalized) {
      hiddenTextareaRef.current.value = normalized;
    }
  }, []);

  useEffect(() => {
    if (typeof value === 'string') {
      syncEditorContent(value);
      return;
    }
    if (typeof defaultValue === 'string') {
      syncEditorContent(defaultValue);
      return;
    }
    if (hiddenTextareaRef.current?.value) {
      syncEditorContent(hiddenTextareaRef.current.value);
    }
  }, [defaultValue, syncEditorContent, value]);

  useEffect(() => {
    const syncFromHiddenField = () => {
      const nextValue = hiddenTextareaRef.current?.value ?? '';
      if (nextValue !== html) {
        syncEditorContent(nextValue);
      }
    };

    syncFromHiddenField();
    const frame = window.requestAnimationFrame(syncFromHiddenField);
    return () => window.cancelAnimationFrame(frame);
  }, [html, syncEditorContent]);

  const emitChange = useCallback(
    (nextValue: string) => {
      if (!onChange) return;
      onChange({
        target: { name, value: nextValue },
        currentTarget: { name, value: nextValue },
        type: 'change',
      } as React.ChangeEvent<HTMLTextAreaElement>);
    },
    [name, onChange]
  );

  const emitBlur = useCallback(() => {
    if (!onBlur) return;
    onBlur({
      target: { name, value: hiddenTextareaRef.current?.value ?? '' },
      currentTarget: { name, value: hiddenTextareaRef.current?.value ?? '' },
      type: 'blur',
    } as React.FocusEvent<HTMLTextAreaElement>);
  }, [name, onBlur]);

  const updateActiveCommands = useCallback(() => {
    if (typeof document === 'undefined') return;
    const nextCommands = TOOLBAR_ITEMS.filter((item) =>
      document.queryCommandState(item.command)
    ).map((item) => item.command);
    setActiveCommands(nextCommands);
  }, []);

  const handleInput = useCallback(() => {
    const nextValue = normalizeHtml(editorRef.current?.innerHTML ?? '');
    syncEditorContent(nextValue);
    emitChange(nextValue);
    updateActiveCommands();
  }, [emitChange, syncEditorContent, updateActiveCommands]);

  const applyCommand = useCallback(
    (command: SupportedCommand) => {
      if (disabled || !editorRef.current) return;
      editorRef.current.focus();
      document.execCommand(command, false);
      handleInput();
    },
    [disabled, handleInput]
  );

  useEffect(() => {
    document.addEventListener('selectionchange', updateActiveCommands);
    return () =>
      document.removeEventListener('selectionchange', updateActiveCommands);
  }, [updateActiveCommands]);

  const editorMinHeight = useMemo(
    () => `${Math.max(Number(rows) || 4, 4) * 1.75}rem`,
    [rows]
  );

  return (
    <div className={cn('mb-4', className)}>
      {label && (
        <label
          htmlFor={name}
          className="mb-3 block text-sm font-semibold leading-none text-body-dark"
        >
          {label}
        </label>
      )}

      <div className={rootClassName}>
        <div className={classes.toolbar}>
          {TOOLBAR_ITEMS.map((item) => (
            <button
              key={item.command}
              type="button"
              title={item.title}
              aria-label={item.title}
              disabled={disabled}
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => applyCommand(item.command)}
              className={cn(classes.toolbarButton, {
                [classes.toolbarButtonActive]: activeCommands.includes(
                  item.command
                ),
                'cursor-not-allowed opacity-50': disabled,
              })}
            >
              {item.label}
            </button>
          ))}
        </div>

        <div className="relative">
          {!html && placeholder && (
            <span className="pointer-events-none absolute left-4 top-3 text-sm text-gray-400">
              {placeholder}
            </span>
          )}
          <div
            id={name}
            ref={editorRef}
            contentEditable={!disabled}
            suppressContentEditableWarning
            className={cn(classes.editor, 'prose prose-sm max-w-none', {
              'cursor-not-allowed select-none bg-[#EEF1F4] text-body':
                disabled,
            })}
            style={{ minHeight: editorMinHeight }}
            onInput={handleInput}
            onBlur={() => {
              handleInput();
              emitBlur();
            }}
            onFocus={updateActiveCommands}
            aria-invalid={error ? 'true' : 'false'}
            aria-disabled={disabled ? 'true' : 'false'}
          />
        </div>
      </div>

      <textarea
        {...rest}
        ref={(node) => {
          hiddenTextareaRef.current = node;
          assignRef(ref, node);
        }}
        id={`${name}-hidden`}
        name={name}
        defaultValue={defaultValue}
        value={typeof value === 'string' ? value : undefined}
        onChange={() => undefined}
        tabIndex={-1}
        className="sr-only"
        aria-hidden="true"
      />

      {note && <p className="mt-2 text-xs text-body">{note}</p>}
      {error && <p className="my-2 text-xs text-start text-red-500">{error}</p>}
    </div>
  );
});

Editor.displayName = 'Editor';

export default Editor;
