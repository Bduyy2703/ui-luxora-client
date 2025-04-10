// import { combineReducers } from 'redux';

// const reducerCombined = {};

// const reducers = require.context('./', true, /.\.js?$/);
// reducers.keys().forEach((path) => {
//     if (path !== './index.js') {
//         const reducer = reducers(path).default;
//         reducerCombined[reducer.name] = reducer;
//     }
// });

// const rootReducer = combineReducers(reducerCombined);

// export default rootReducer;


// reducers/index.js
import { combineReducers } from 'redux';

const initialState = {
    locale: 'en'
};

const appReducer = (state = initialState, action) => {
    switch (action.type) {
        case 'SET_LOCALE':
            return {
                ...state,
                locale: action.payload
            };
        default:
            return state;
    }
};

const rootReducer = combineReducers({
    app: appReducer
});

export default rootReducer;
