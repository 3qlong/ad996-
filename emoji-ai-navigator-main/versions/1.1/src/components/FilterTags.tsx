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
    <div className="flex items-center justify-center flex-wrap gap-2">
      {tags.map((tag) => (
        <button
          key={tag.name}
          onClick={() => setActiveTag(tag.name)}
          className={`
            flex items-center gap-1.5 px-4 py-2 rounded-full text-sm
            transition-all duration-200 ease-out
            ${activeTag === tag.name
              ? 'bg-gray-900 text-white shadow-md scale-105'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-900'
            }
          `}
        >
          <span className="text-base">{tag.emoji}</span>
          <span className="font-medium">{tag.name}</span>
        </button>
      ))}
    </div>
  );
};

export default FilterTags;
