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

// Filter Link Component
const FilterLink = ({filter, currentFilter, children}) => {
  if (filter == currentFilter) {
    return <span>{children}</span>
  }
  return (
    <a 
      href="#"
      onClick={e => {
        e.preventDefault();
        store.dispatch({
          type: 'SET_VISIBILITY_FILTER',
          filter: filter
        });
      }}
    >
      {children}
    </a>
  )
}

const getVisibleTodos = (todos, filter) => {
  switch(filter) {
    case 'SHOW_ALL':
      return todos;
    case 'SHOW_COMPLETED':
      return todos.filter(
        t => t.completed
      );
    case 'SHOW_ACTIVE':
      return todos.filter(
        t => !t.completed
      );
  }
}

let nextTodoId = 0;

class TodoApp extends Component {
  render() {
    const { todos, visibilityFilter } = this.props;
    const visibleTodos = getVisibleTodos(todos, visibilityFilter);
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
          {visibleTodos.map(todo => 
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
        <p>
          Show:
          {' '}
          <FilterLink
            filter='SHOW_ALL'
            currentFilter={visibilityFilter}
          >
          All
          </FilterLink>
          {' '}
          <FilterLink
            filter='SHOW_ACTIVE'
            currentFilter={visibilityFilter}
          >
          Active
          </FilterLink>
          {' '}
          <FilterLink
            filter='SHOW_COMPLETED'
            currentFilter={visibilityFilter}
          >
          Completed
          </FilterLink>
        </p>
      </div>
    );
  }
}

const render = () => {
  // spreads the todo and visibility filter across the TodoApp component
  ReactDOM.render(
    <TodoApp 
      {...store.getState()}
    />,
    document.getElementById('root')
  );
};

store.subscribe(render);
render();
