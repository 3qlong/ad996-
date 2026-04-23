import React from 'react';

interface FilterTag {
  name: string;
  emoji: string;
}

interface FilterTagsProps {
  tags: FilterTag[];
  activeTag: string;
  setActiveTag: (tag: string) => void;
}

const FilterTags: React.FC<FilterTagsProps> = ({ tags, activeTag, setActiveTag }) => {
  return (
    <div className="flex items-center justify-center flex-wrap gap-y-2">
      {tags.map((tag, index) => (
        <React.Fragment key={tag.name}>
          <button
            onClick={() => setActiveTag(tag.name)}
            className={`flex items-center justify-center gap-2 px-4 py-1 rounded-md text-sm text-center transition-colors font-medium ${
              activeTag === tag.name
                ? 'bg-white text-gray-900 shadow'
                : 'bg-transparent text-gray-600'
            }`}
          >
            <span>{tag.emoji}</span>
            <span>{tag.name}</span>
          </button>
          {index < tags.length - 1 && <span className="mx-2 text-gray-400 hidden sm:inline">|</span>}
        </React.Fragment>
      ))}
    </div>
  );
};

export default FilterTags;
