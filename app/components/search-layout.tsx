import { Icon } from "#app/components/icon";
import { debounce } from "#app/utils/debounce";
import { formatList } from "#app/utils/format";
import { type SearchResultItem, searchResultSchema } from "#app/utils/search";
import { createHomeUrl } from "#app/utils/url";
import { type ReactNode, useId, useRef } from "react";
import {
  ComboBox,
  Input,
  ListBox,
  ListBoxItem,
  Popover,
} from "react-aria-components";
import { Form, useNavigate } from "react-router";
import { type AsyncListOptions, useAsyncList } from "react-stately";

const load: AsyncListOptions<SearchResultItem, string>["load"] = debounce(
  async ({ signal, filterText = "" }) => {
    const response = await fetch(
      `/api/search?${new URLSearchParams({ name: filterText })}`,
      { signal },
    );
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const json = await response.json();
    if (signal.aborted) {
      throw new Error("Aborted during JSON parse");
    }
    return searchResultSchema.parse(json);
  },
  400,
);

export const SearchLayout = ({ children }: { children: ReactNode }) => {
  const navigate = useNavigate();
  const searchHeadingId = useId();
  const weatherRegionRef = useRef<HTMLElement>(null);
  const list = useAsyncList<SearchResultItem>({
    load,
  });

  return (
    <>
      <h1 className="text-preset-2 text-center">
        How’s the sky looking today?
      </h1>
      <section
        className="[ search ] [ center ] [ mt-600 tablet:mt-800 ]"
        aria-labelledby={searchHeadingId}
      >
        <h2 className="sr-only" id={searchHeadingId}>
          Search
        </h2>
        <Form
          className="search__form"
          preventScrollReset
          onSubmit={() => {
            weatherRegionRef.current?.focus();
          }}
        >
          <ComboBox
            className="search-combobox"
            aria-label="Search for a place"
            allowsCustomValue
            allowsEmptyCollection
            inputValue={list.filterText}
            onInputChange={(value) => {
              list.setFilterText(value);
            }}
            onSelectionChange={(key) => {
              if (key === null) return;

              const item = list.getItem(key);
              if (item === undefined) return;

              void navigate(
                createHomeUrl({
                  lat: item.latitude.toString(),
                  lon: item.longitude.toString(),
                }),
                { preventScrollReset: true },
              );
              // Let React Aria set the `inputValue` before closing the popover
              setTimeout(() => {
                weatherRegionRef.current?.focus();
              });
            }}
            items={list.items}
          >
            <div className="search-input">
              <Input
                className="search-input__input"
                name="q"
                placeholder="Search for a place..."
              />
              <Icon className="search-input__icon" name="IconSearch" />
            </div>
            <Popover className="search-combobox__popover" offset={10}>
              <ListBox
                renderEmptyState={() => (
                  <div className="search-combobox__empty-state">
                    {list.isLoading ? (
                      <>
                        <Icon name="IconLoading" /> Search in progress
                      </>
                    ) : (
                      "No suggestions"
                    )}
                  </div>
                )}
              >
                {(item: SearchResultItem) => (
                  <ListBoxItem textValue={item.name}>
                    {formatList([item.name, item.admin1])}
                  </ListBoxItem>
                )}
              </ListBox>
            </Popover>
          </ComboBox>
          <button className="primary-button">Search</button>
        </Form>
      </section>
      <section
        className="weather"
        ref={weatherRegionRef}
        tabIndex={-1}
        aria-label="Weather"
      >
        {children}
      </section>
    </>
  );
};
