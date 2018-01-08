import React from 'react';

class Table extends React.Component {
  render() {
    const { columns, rows } = this.props;

    return (
      <table>
        <thead>
          <tr>{columns.map(([name]) => <td key={name}>{name}</td>)}</tr>
        </thead>
        <tbody>
          {rows.map(row => (
            <tr key={row.id}>
              {columns.map(([name, key]) => (
                <td key={`${row.id}.${key}`}>{row[key]}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    );
  }
}

export default Table;
