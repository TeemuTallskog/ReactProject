import SearchIcon from '@mui/icons-material/Search';
import {useEffect, useRef, useState} from "react";
import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';
import CircularProgress from '@mui/material/CircularProgress';
import '../resources/css/autocompleteSearchBar.css';
import * as React from 'react';
import '../resources/css/customUserSearch.css';
import UserCard from "./UserCard";
import DrowDownOptionField from "./DrowDownOptionField";
const axios = require('axios');


/**
 * Search bar that allows user to search other users
 * @returns {JSX.Element}
 * @constructor
 */
function CustomUserSearch(){
    /**
     * {options} array of loaded users
     * {loading} boolean - is the client already doing a query
     * {search} search input string
     * {textAreaRef} reference to the text area
     * {isOpen} is the text area focused
     */
    const [options, setOptions] = React.useState([]);
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState({
        input: ''
    });
    const textAreaRef = useRef(null);
    const [isOpen, setIsOpen] = useState(false);


    /**
     * when search term gets changed query gets sent to the database
     */
    const onChange = (e) => {
        setSearch({...search, [e.target.name]: e.target.value});
        setIsOpen(true);
        if(!loading) {
            (async () => {
                setLoading(true);
                const response = await axios.get('http://localhost:8080/users', {
                    params: {username: search.input},
                    headers:{authorization: localStorage.getItem("accessToken")}
                });
                setOptions([...response.data.users]);
                setTimeout(function(){
                    setLoading(false);
                }, 100)
            })().catch((error) => setLoading(false));
        }
    }

    const generateUserCard = (option) =>{
        return <UserCard user={option} key={option.user_id}/>
    }

    useEffect(() => window.addEventListener('click', ev => {
        if(textAreaRef.current && textAreaRef.current.contains(ev.target)) {setIsOpen(!isOpen)}
        else {setIsOpen(false)}
    }));

    return (
        <div>
        <TextField
            className="search-field"
            type="text"
            name="input"
            value={search.input}
            onChange={onChange}
            autoComplete="off"
            placeholder="Search users..."
            ref={textAreaRef}
        />
            <div className={isOpen ? null : 'hide-dropdown'}><DrowDownOptionField options={options} search={search.input}/></div>
        </div>
    );
}

export default CustomUserSearch;