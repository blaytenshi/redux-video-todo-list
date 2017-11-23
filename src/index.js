import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import { createStore, combineReducers } from 'redux';

// reducer structure:
// todoApp
// - todos
//   - todo
// - visibilityFilter

const todo = (state, action) => {
  switch(action.type) {
    case 'ADD_TODO':
      return {
        id: action.id,
        text: action.text,
        completed: false
      };
    case 'TOGGLE_TODO':
      if (state.id !== action.id) {
        return state;
      }
      return {
        ...state,
        completed: !state.completed
      };
    default:
      return state;
  }
}

// this was old root reducer!
const todos = (state = [], action) => {
  switch (action.type) {
    // Adds Todos
    case 'ADD_TODO':
      return [
        ...state,
        todo(undefined, action)
      ];
    // Toggles Todos
    case 'TOGGLE_TODO':
      // Iterate through every todo item in the array and runs 
      // the todo() function and returns a new array
      return state.map(t => todo(t, action));
    default:
      return state;
  }
};

// visibility filter reducer
const visibilityFilter = (state = 'SHOW_ALL', action) => {
  switch(action.type) {
    case 'SET_VISIBILITY_FILTER':
      return action.filter;
    default:
      return state;
  }
};

// root reducer
const todoApp = combineReducers({
  // todos: todos
  todos,
  // visibilityFilter: visibilityFilter
  visibilityFilter
})

// use imported createStore() and pass in root reducer.
// this is now our root state store
const store = createStore(todoApp);

let nextTodoId = 0;

class TodoApp extends Component {
  render() {
    return(
      <div>
        <input ref={node => {
          this.input = node;
        }} />
        <button onClick={() => {
          
          store.dispatch(
            {
              type: 'ADD_TODO',
              text: this.input.value,
              id: nextTodoId++
            }
          );

          this.input.value='';

        }}>
        Add Todo
        </button>
        <ul>
          {this.props.todos.map(todo => 
            <li 
              key={todo.id}
              onClick={() => {
              
                store.dispatch(
                  {
                    type: 'TOGGLE_TODO',
                    id: todo.id
                  }
                );
              }}

              style={{
                textDecoration: todo.completed
                  ? 'line-through'
                  : 'none'
              }}

              >
              {todo.text}
            </li>
          )}
        </ul>
      </div>
    );
  }
}

const render = () => {
  ReactDOM.render(
    <TodoApp 
      todos={store.getState().todos}
    />,
    document.getElementById('root')
  );
};

store.subscribe(render);
render();
