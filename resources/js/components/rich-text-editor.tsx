import Link from '@tiptap/extension-link';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import {
    Bold,
    Heading2,
    Italic,
    Link2,
    List,
    ListOrdered,
    Quote,
    Redo2,
    Strikethrough,
    Undo2,
} from 'lucide-react';
import { useEffect } from 'react';
import { Button } from '@/components/ui/button';

type Props = {
    value: string;
    onChange: (html: string) => void;
};

export default function RichTextEditor({ value, onChange }: Props) {
    const editor = useEditor({
        extensions: [
            StarterKit,
            Link.configure({
                openOnClick: false,
                HTMLAttributes: { class: 'text-blue-600 underline' },
            }),
        ],
        content: value,
        editorProps: {
            attributes: {
                class: 'tiptap-editor min-h-[260px] focus:outline-none p-3 text-sm leading-relaxed',
            },
        },
        onUpdate: ({ editor }) => {
            onChange(editor.getHTML());
        },
    });

    useEffect(() => {
        if (editor && value !== editor.getHTML()) {
            editor.commands.setContent(value, { emitUpdate: false });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [value]);

    if (!editor) return null;

    const toolBtn = (
        active: boolean,
        onClick: () => void,
        icon: React.ReactNode,
        title: string,
    ) => (
        <Button
            type="button"
            variant={active ? 'default' : 'ghost'}
            size="icon"
            className="size-8"
            onClick={onClick}
            title={title}
        >
            {icon}
        </Button>
    );

    const promptLink = () => {
        const url = window.prompt(
            'Enter URL (leave blank to remove):',
            editor.getAttributes('link').href ?? '',
        );
        if (url === null) return;
        if (url === '') {
            editor.chain().focus().unsetLink().run();
        } else {
            editor.chain().focus().setLink({ href: url }).run();
        }
    };

    return (
        <div className="rounded-md border bg-background">
            <div className="flex flex-wrap items-center gap-1 border-b p-1.5">
                {toolBtn(
                    editor.isActive('bold'),
                    () => editor.chain().focus().toggleBold().run(),
                    <Bold className="size-4" />,
                    'Bold',
                )}
                {toolBtn(
                    editor.isActive('italic'),
                    () => editor.chain().focus().toggleItalic().run(),
                    <Italic className="size-4" />,
                    'Italic',
                )}
                {toolBtn(
                    editor.isActive('strike'),
                    () => editor.chain().focus().toggleStrike().run(),
                    <Strikethrough className="size-4" />,
                    'Strikethrough',
                )}
                {toolBtn(
                    editor.isActive('heading', { level: 2 }),
                    () =>
                        editor.chain().focus().toggleHeading({ level: 2 }).run(),
                    <Heading2 className="size-4" />,
                    'Heading',
                )}
                {toolBtn(
                    editor.isActive('bulletList'),
                    () => editor.chain().focus().toggleBulletList().run(),
                    <List className="size-4" />,
                    'Bullet list',
                )}
                {toolBtn(
                    editor.isActive('orderedList'),
                    () => editor.chain().focus().toggleOrderedList().run(),
                    <ListOrdered className="size-4" />,
                    'Numbered list',
                )}
                {toolBtn(
                    editor.isActive('blockquote'),
                    () => editor.chain().focus().toggleBlockquote().run(),
                    <Quote className="size-4" />,
                    'Quote',
                )}
                {toolBtn(
                    editor.isActive('link'),
                    promptLink,
                    <Link2 className="size-4" />,
                    'Link',
                )}
                <div className="ml-auto flex gap-1">
                    {toolBtn(
                        false,
                        () => editor.chain().focus().undo().run(),
                        <Undo2 className="size-4" />,
                        'Undo',
                    )}
                    {toolBtn(
                        false,
                        () => editor.chain().focus().redo().run(),
                        <Redo2 className="size-4" />,
                        'Redo',
                    )}
                </div>
            </div>
            <EditorContent editor={editor} />
        </div>
    );
}
