import expect from 'expect';
import deepFreeze from 'deep-freeze';
import { createStore } from 'redux';

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

// this is now the root reducer!
const todoApp = (state = {}, action) => {
  return {
    todos: todos(
      state.todos,
      action
    ),
    visibilityFilter: visibilityFilter(
      state.visibilityFilter,
      action
    )
  };
};

// use imported createStore() and pass in root reducer.
// this is now our root state store
const store = createStore(todoApp);

// dispatching actions to the store to make changes
// to state and logging them out
console.log('Initial State:');
console.log(store.getState());
console.log('--------------');

console.log('Dispatching ADD_TODO');
store.dispatch({
  type: 'ADD_TODO',
  id: 0,
  text: 'Learn Redux'
});

console.log('Current State:');
console.log(store.getState());
console.log('--------------');

console.log('Dispatching ADD_TODO');
store.dispatch({
  type: 'ADD_TODO',
  id: 1,
  text: 'Go Shopping'
});

console.log('Current State:');
console.log(store.getState());
console.log('--------------');

console.log('Dispatching TOGGLE_TODO');
store.dispatch({
  type: 'TOGGLE_TODO',
  id: 0
});

console.log('Current State:');
console.log(store.getState());
console.log('--------------');

console.log('Dispatching SET_VISIBILITY_FILTER');
store.dispatch({
  type: 'SET_VISIBILITY_FILTER',
  filter: 'SHOW_COMPLETED'
});

console.log('Current State:');
console.log(store.getState());
console.log('--------------');