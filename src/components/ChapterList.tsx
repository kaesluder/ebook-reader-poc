import { Accordion, AccordionPanel, AccordionTitle, AccordionContent } from 'flowbite-react';
import { useEpub } from '../epub/store/EpubContext';
import type { NavItem } from '../epub/types';

function NavItemList({
  items,
  selectedHref,
  onSelect,
  depth = 0,
}: {
  items: NavItem[];
  selectedHref: string | null;
  onSelect: (href: string) => void;
  depth?: number;
}) {
  return (
    <ul className={depth > 0 ? 'ml-4 mt-1 space-y-1' : 'space-y-1'}>
      {items.map((item) => (
        <li key={item.href}>
          <button
            type="button"
            onClick={() => onSelect(item.href)}
            className={`w-full text-left px-2 py-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 ${
              item.href === selectedHref
                ? 'font-bold text-blue-600 dark:text-blue-400'
                : 'text-gray-800 dark:text-gray-200'
            }`}
          >
            {item.label}
          </button>
          {item.children.length > 0 && (
            <NavItemList
              items={item.children}
              selectedHref={selectedHref}
              onSelect={onSelect}
              depth={depth + 1}
            />
          )}
        </li>
      ))}
    </ul>
  );
}

export default function ChapterList() {
  const { state, dispatch } = useEpub();

  if (state.status !== 'loaded' || !state.book || state.book.toc.length === 0) {
    return null;
  }

  return (
    <Accordion>
      <AccordionPanel>
        <AccordionTitle>Chapters</AccordionTitle>
        <AccordionContent>
          <NavItemList
            items={state.book.toc}
            selectedHref={state.selectedChapterHref}
            onSelect={(href) => dispatch({ type: 'SELECT_CHAPTER', href })}
          />
        </AccordionContent>
      </AccordionPanel>
    </Accordion>
  );
}
