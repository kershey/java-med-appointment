'use client';

import * as React from 'react';
import { X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

export interface Option {
  label: string;
  value: string;
}

interface MultiSelectorProps {
  options: Option[];
  selected: Option[];
  onChange: (options: Option[]) => void;
  placeholder?: string;
  className?: string;
}

export function MultiSelector({
  options,
  selected,
  onChange,
  placeholder = 'Select options',
  className,
}: MultiSelectorProps) {
  const [open, setOpen] = React.useState(false);

  const handleUnselect = (option: Option) => {
    onChange(selected.filter((item) => item.value !== option.value));
  };

  const handleSelect = (option: Option) => {
    if (selected.some((item) => item.value === option.value)) {
      onChange(selected.filter((item) => item.value !== option.value));
    } else {
      onChange([...selected, option]);
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn('w-full justify-between', className)}
        >
          {placeholder}
          <span className="ml-2 rounded-sm bg-primary/10 px-1 text-xs font-semibold">
            {selected.length}
          </span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0" align="start">
        <Command>
          <CommandInput
            placeholder={`Search ${placeholder.toLowerCase()}...`}
          />
          <CommandList>
            <CommandEmpty>No options found.</CommandEmpty>
            <CommandGroup>
              {options.map((option) => {
                const isSelected = selected.some(
                  (item) => item.value === option.value
                );
                return (
                  <CommandItem
                    key={option.value}
                    value={option.value}
                    onSelect={() => handleSelect(option)}
                  >
                    <div
                      className={cn(
                        'mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary',
                        isSelected
                          ? 'bg-primary text-primary-foreground'
                          : 'opacity-50 [&_svg]:invisible'
                      )}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        width="16"
                        height="16"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="h-3 w-3"
                      >
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    </div>
                    <span>{option.label}</span>
                  </CommandItem>
                );
              })}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
      <div className="flex flex-wrap gap-1 mt-2">
        {selected.map((option) => (
          <Badge
            key={option.value}
            variant="secondary"
            className="flex items-center gap-1"
          >
            {option.label}
            <button
              className="rounded-full outline-none focus:ring-2 focus:ring-primary"
              onClick={() => handleUnselect(option)}
              type="button"
              aria-label={`Remove ${option.label}`}
            >
              <X className="h-3 w-3" />
            </button>
          </Badge>
        ))}
      </div>
    </Popover>
  );
}
