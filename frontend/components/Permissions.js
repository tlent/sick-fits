import { Query, Mutation } from "react-apollo";
import React, { Component } from "react";
import ErrorMessage from "./ErrorMessage";
import gql from "graphql-tag";
import Table from "./styles/Table";
import SickButton from "./styles/SickButton";
import PropTypes from "prop-types";

const ALL_USERS_QUERY = gql`
  query ALL_USERS_QUERY {
    users {
      id
      name
      email
      permissions
    }
  }
`;

const SET_PERMISSIONS_MUTATION = gql`
  mutation SET_PERMISSIONS_MUTATION(
    $userID: ID!
    $permissions: [Permission!]!
  ) {
    setPermissions(userID: $userID, permissions: $permissions) {
      id
      permissions
    }
  }
`;

const possiblePermissions = [
  "ADMIN",
  "USER",
  "PERMISSION_UPDATE",
  "ITEM_CREATE",
  "ITEM_UPDATE",
  "ITEM_DELETE"
];

const Permissions = props => (
  <Query query={ALL_USERS_QUERY}>
    {({ data, loading, error }) => (
      <div>
        <ErrorMessage error={error} />
        <div>
          <h2>Manage Permissions</h2>
          <Table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                {possiblePermissions.map(permission => (
                  <th key={permission}>{permission}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.users.map(user => (
                <UserPermissions user={user} key={user.id} />
              ))}
            </tbody>
          </Table>
        </div>
      </div>
    )}
  </Query>
);

class UserPermissions extends Component {
  static propTypes = {
    user: PropTypes.shape({
      name: PropTypes.string,
      email: PropTypes.string,
      id: PropTypes.string,
      permissions: PropTypes.arrayOf(PropTypes.string)
    }).isRequired
  };
  state = { permissions: this.props.user.permissions };
  handlePermissionChange = e => {
    const { value, checked } = e.target;
    this.setState(({ permissions }) => ({
      permissions: checked
        ? [...permissions, value]
        : permissions.filter(permission => permission !== value)
    }));
  };
  render() {
    const { user } = this.props;
    const { permissions } = this.state;
    return (
      <Mutation
        mutation={SET_PERMISSIONS_MUTATION}
        variables={{ userID: user.id, permissions }}
      >
        {(setPermissions, { loading, error }) => (
          <>
            {error && (
              <tr>
                <td colspan="8">
                  <ErrorMessage error={error} />
                </td>
              </tr>
            )}
            <tr>
              <td>{user.name}</td>
              <td>{user.email}</td>
              {possiblePermissions.map(permission => (
                <td key={permission}>
                  <label htmlFor={`${user.id}-permission-${permission}`}>
                    <input
                      id={`${user.id}-permission-${permission}`}
                      type="checkbox"
                      checked={this.state.permissions.includes(permission)}
                      value={permission}
                      onChange={this.handlePermissionChange}
                    />
                  </label>
                </td>
              ))}
              <td>
                <SickButton
                  onClick={setPermissions}
                  type="button"
                  disabled={loading}
                >
                  {loading ? "Updating..." : "Update"}
                </SickButton>
              </td>
            </tr>
          </>
        )}
      </Mutation>
    );
  }
}

export default Permissions;
