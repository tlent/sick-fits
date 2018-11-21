import React, { Component } from "react";
import Downshift, { resetIdCounter } from "downshift";
import Router from "next/router";
import gql from "graphql-tag";
import debounce from "lodash.debounce";
import { ApolloConsumer } from "react-apollo";
import { DropDown, DropDownItem, SearchStyles } from "./styles/DropDown";

const SEARCH_ITEMS_QUERY = gql`
  query SEARCH_ITEMS_QUERY($searchTerm: String!) {
    items(
      where: {
        OR: [
          { title_contains: $searchTerm }
          { description_contains: $searchTerm }
        ]
      }
    ) {
      id
      title
      image
    }
  }
`;

function routeToItem(item) {
  Router.push({ pathname: "/item", query: { id: item.id } });
}

class Autocomplete extends Component {
  state = {
    loading: false,
    items: [],
    typing: false
  };
  handleChange = (e, client) => {
    this.setState({ typing: true });
    const doRequest = debounce(async () => {
      const searchTerm = e.target.value;
      if (!searchTerm) {
        this.setState({ loading: false, items: [] });
        return;
      }
      this.setState({ loading: true, typing: false });
      const response = await client.query({
        query: SEARCH_ITEMS_QUERY,
        variables: { searchTerm }
      });
      this.setState({ loading: false, items: response.data.items });
    }, 350);
    doRequest();
  };
  render() {
    resetIdCounter();
    return (
      <SearchStyles>
        <Downshift
          itemToString={item => (item === null ? "" : item.title)}
          onChange={routeToItem}
        >
          {({
            getItemProps,
            getInputProps,
            isOpen,
            inputValue,
            highlightedIndex
          }) => (
            <div>
              <ApolloConsumer>
                {client => (
                  <input
                    {...getInputProps({
                      type: "search",
                      placeholder: "Search for an item",
                      id: "search",
                      className: this.state.loading ? "loading" : "",
                      onChange: e => {
                        e.persist();
                        this.handleChange(e, client);
                      }
                    })}
                  />
                )}
              </ApolloConsumer>
              {isOpen && (
                <DropDown>
                  {this.state.items.map((item, index) => (
                    <DropDownItem
                      {...getItemProps({ item })}
                      key={item.id}
                      highlighted={index === highlightedIndex}
                    >
                      <img width="50" src={item.image} alt={item.title} />
                      {item.title}
                    </DropDownItem>
                  ))}
                  {!this.state.typing &&
                    !this.state.items.length &&
                    !this.state.loading && (
                      <DropDownItem>
                        Nothing found for {inputValue}
                      </DropDownItem>
                    )}
                </DropDown>
              )}
            </div>
          )}
        </Downshift>
      </SearchStyles>
    );
  }
}

export default Autocomplete;
