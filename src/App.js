import React, { Component } from 'react';
import math from 'mathjs';
import transform from 'lodash/transform';

import './App.css';

class App extends Component {
  static defaultProps = {
    users: ['Patiwi', 'Geri', 'Jaime', 'Vicho', 'Belén'],
    items: ['A', 'B', 'C', 'D'],
    min: 0,
    max: 10,
    step: 1,
  }

  constructor(props) {
    super(props);
    this.state = {
      users: props.users,
      items: props.items,
      matrix: math.zeros(props.users.length, props.items.length),
    };
    // console.log(this.state.matrix.toString());
  }

  onRatingChange = (e, pos) => {
    const matrix = this.state.matrix.clone();
    matrix.set(pos, Number(e.target.value));
    this.setState({ matrix });
  }

  dev = (j, i) => {
    const matrix = this.state.matrix;
    const common = this.card(j, i);
    const count = common.length;

    if (count === 0) return { count, sum: 0, avg: 0 };

    const sum = common.reduce((total, u) => {
      const u_j = matrix.get([u, j]);
      const u_i = matrix.get([u, i]);
      return total + (u_j - u_i);
    }, 0);

    // console.log({ sum, count, avg: sum / count });

    return { sum, count, avg: sum / count };
  }

  card = (j, i) => {
    const { users, matrix } = this.state;
    // Indexes of users that has rated both 'j' and 'i' items
    return transform(users, (acc, _, u) => {
      const u_j = matrix.get([u, j]);
      const u_i = matrix.get([u, i]);
      if (u_j !== 0 && u_i !== 0) acc.push(u);
    }, []);
  }

  p = (u, j) => {
    const { matrix } = this.state;

    const items = this.state.items
      .map((_, i) => i) // only use indexes
      .filter(i => i !== j && matrix.get([u, i]) !== 0); // items from user that are not the current being recommended

    if (items.length === 0) return null;

    const wsum = items.reduce((total, i) => {
      const c_ij = this.card(j, i).length;
      const { avg } = this.dev(j, i);
      return total + ((avg + matrix.get([u, i])) * c_ij);
    }, 0);

    const normalizer = items.reduce((total, i) => total + this.card(j, i).length, 0);

    if (normalizer === 0) return null;
    else return (wsum / normalizer);
  }

  render() {
    const { users, items, matrix } = this.state;
    const { min, max, step } = this.props;

    const input = {
      min,
      max,
      step,
      type: 'number',
    };

    return (
      <div className="App">
        <div className="container">
          <h1>Slope One</h1>
          <table className="table table-striped">
            <thead>
              <tr>
                <td key="#">#</td>
                {items.map(item => (
                  <td key={item}>{item}</td>
                ))}
              </tr>
            </thead>
            <tbody>
              {users.map((user, u) => (
                <tr key={user}>
                  <td key="user">
                    {user}
                  </td>
                  {items.map((item, j) => {
                    const predict = this.p(u, j);
                    return (
                      <td key={item}>
                        <input {...input} value={matrix.get([u, j])} onChange={event => this.onRatingChange(event, [u, j])} />
                        <span>{predict ? predict.toFixed(2) : null}</span>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }
}

export default App;
