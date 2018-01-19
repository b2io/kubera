import { isFunction } from 'lodash';
import React from 'react';
import { Table as SemanticTable } from 'semantic-ui-react';

class Table extends React.Component {
  render() {
    const { columns, rows } = this.props;

    return (
      <SemanticTable celled>
        <SemanticTable.Header>
          <SemanticTable.Row>
            {columns.map(([name]) => (
              <SemanticTable.HeaderCell key={name}>
                {name}
              </SemanticTable.HeaderCell>
            ))}
          </SemanticTable.Row>
        </SemanticTable.Header>
        <SemanticTable.Body>
          {rows.map(row => (
            <SemanticTable.Row key={row.id}>
              {columns.map(([name, key]) => (
                <SemanticTable.Cell key={`${row.id}.${key}`}>
                  {isFunction(key) ? key(row) : row[key]}
                </SemanticTable.Cell>
              ))}
            </SemanticTable.Row>
          ))}
        </SemanticTable.Body>
      </SemanticTable>
    );
  }
}

export default Table;
