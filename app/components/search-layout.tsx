import { Icon } from "#app/components/icon";
import { type SearchResultItem, searchResultSchema } from "#app/utils/search";
import { createHomeUrl } from "#app/utils/url";
import { type ReactNode, useId } from "react";
import {
  ComboBox,
  Input,
  ListBox,
  ListBoxItem,
  Popover,
} from "react-aria-components";
import { Form, useNavigate, useNavigation } from "react-router";
import { useAsyncList } from "react-stately";

export const SearchLayout = ({ children }: { children: ReactNode }) => {
  const navigation = useNavigation();
  const navigate = useNavigate();
  const searchHeadingId = useId();
  const list = useAsyncList<SearchResultItem>({
    load: async ({ signal, filterText = "" }) => {
      const response = await fetch(
        `/api/search?${new URLSearchParams({ name: filterText })}`,
        { signal }
      );
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const json = await response.json();
      if (signal.aborted) {
        throw new Error("Aborted during JSON parse");
      }
      return searchResultSchema.parse(json);
    },
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
        <Form className="search__form">
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
                })
              );
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
                      "No recommendations"
                    )}
                  </div>
                )}
              >
                {(item: SearchResultItem) => (
                  <ListBoxItem>{item.name}</ListBoxItem>
                )}
              </ListBox>
            </Popover>
          </ComboBox>
          <button className="primary-button">
            {navigation.state === "idle" ? "Search" : "Searching..."}
          </button>
        </Form>
      </section>
      {children}
    </>
  );
};
