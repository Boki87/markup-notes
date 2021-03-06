import React, {createContext, useReducer, useEffect, useContext} from 'react'
import authReducer from './reducer'

import {useToasts} from '../toasts/provider'

import {useFirebase} from '../../utils/firebase'

import {
    LOGIN_SUCCESS,    
    LOGIN_FAIL,    
    REGISTER_FAIL,
    LOGOUT,    
    SET_LOADING,    
    CLEAR_ERRORS    
} from '../types'

const AuthContext = createContext()

export const useAuth = () => useContext(AuthContext)

const AuthProvider = ({children}) => {

    const initialState = {
        user: {
            email:'',
            uid:''
        },
        error: null,
        loading: true
    }

    const {firebaseApp} = useFirebase()

    const [state, dispatch] = useReducer(authReducer, initialState)


    const {setToast} = useToasts()

    useEffect(() => {
        firebaseApp.auth().onAuthStateChanged(function(user) {
            if(user) {
                dispatch({
                    type: LOGIN_SUCCESS,
                    payload: {email:user.email,uid:user.uid}
                })
            }else{
              dispatch({
                  type: LOGOUT
              })
            }
        })
    }, [])



    const userLogin = (email, password) => {
        firebaseApp.auth().signInWithEmailAndPassword(email,password)
        .then(res => {
            setToast('Successful signin', 'confirm')            
        })
        .catch((err) => {
            
            setToast('Wrong email or password', 'alert')

            dispatch({
                type: LOGIN_FAIL,
                payload: 'Wrong email or password'
            })
          })
    }

    const userSignup = (email, password) => {
        firebaseApp.auth().createUserWithEmailAndPassword(email,password)
        .then(res => {
            
        })
        .catch((err) => {
            console.log(err)
            setToast(err.message)
          })
    }

    const userLogout = () => {
        firebaseApp.auth().signOut().then(function() {
            // Sign-out successful.

          }).catch(function(error) {
            // An error happened.
          });
    }

    const setLoading = (val) => {
        dispatch({type: SET_LOADING, payload: val})
    }

    return (
        <AuthContext.Provider value={{
            user: state.user,
            error: state.error,
            loading: state.loading,
            userLogin,
            userLogout,
            userSignup,
            setLoading
        }}>
            {children}
        </AuthContext.Provider>
    )
}

export default AuthProvider
