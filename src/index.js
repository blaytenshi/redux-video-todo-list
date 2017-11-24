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

// Link Component
const Link = ({ active, children, onClick }) => {
  if (active) {
    return <span>{children}</span>
  }
  return (
    <a 
      href="#"
      onClick={e => {
        e.preventDefault();
        onClick();
      }}
    >
      {children}
    </a>
  )
}

// FilterLink Component
class FilterLink extends Component {
  componentDidMount() {
    this.unsubscribe = store.subscribe(() =>
      this.forceUpdate()
    );
  }

  componentWillUnmount() {
    this.unsubscribe();
  }

  render() {
    
    const props = this.props;
    const state = store.getState();

    return (
      <Link
        active={
          props.filter === state.visibilityFilter
        }
        onClick={() => 
          store.dispatch({
            type: 'SET_VISIBILITY_FILTER',
            filter: props.filter
          })
        }
      >
        {props.children}
      </Link>
    )
  }

}

// 'Presentational' Todo Component
const Todo = ({ onClick, completed, text }) => (
  <li
    onClick={onClick}

    style={{
      textDecoration: completed
        ? 'line-through'
        : 'none'
    }}

  >
    {text}
  </li>
);

// 'Presentational TodoList Component. It 'contains' the Todo Components.
const TodoList = ({ todos, onTodoClick }) => (
  <ul>
    {todos.map(todo =>
      <Todo
        key={todo.id}
        {...todo}
        onClick={() => onTodoClick(todo.id)}
      />
    )}
  </ul>
);

const AddTodo = ({ onAddClick }) => {
  let input;

  return (
    <div>
      <input ref={node => {
        input = node;
      }} />
      <button onClick={() => {
        onAddClick(input.value);
        input.value = '';
      }}>
        Add Todo
        </button>
    </div>
  )
}

const Footer = () => (
  <p>
    Show:
    {' '}
    <FilterLink
      filter='SHOW_ALL'
    >
      All
    </FilterLink>
    {', '}
    <FilterLink
      filter='SHOW_ACTIVE'
    >
      Active
    </FilterLink>
    {', '}
    <FilterLink
      filter='SHOW_COMPLETED'
    >
      Completed
    </FilterLink>
  </p>
)

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

// refactored the entire app into just a single expression
const TodoApp = ({ todos, visibilityFilter }) => (
  <div>
    <AddTodo
      onAddClick={text => {
        store.dispatch(
          {
            type: 'ADD_TODO',
            text,
            id: nextTodoId++
          }
        );
      }}
    />
    <TodoList
      todos={getVisibleTodos(todos, visibilityFilter)}
      onTodoClick={id => 
        store.dispatch({
          type: 'TOGGLE_TODO',
          id
        })
      }
    />
    <Footer />
  </div>
)

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