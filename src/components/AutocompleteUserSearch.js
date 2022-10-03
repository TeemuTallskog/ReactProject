import SearchIcon from '@mui/icons-material/Search';
import {useState} from "react";
import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';
import CircularProgress from '@mui/material/CircularProgress';
import '../resources/css/autocompleteSearchBar.css';
import * as React from 'react';
const axios = require('axios');



function AutocompleteUserSearch(){
    const [open, setOpen] = React.useState(false);
    const [options, setOptions] = React.useState([]);
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState({});


    const onChange = (e) => {
        setSearch({...search, [e.target.name]: e.target.value});
        if(!loading) {
            (async () => {
                setLoading(true);
                const response = await axios.get('http://localhost:8080/users', {params: {username: search.input}});
                console.log(response);
                setOptions([...response.data.users]);
                setTimeout(function(){
                    setLoading(false);
                }, 500)
            })().catch((error) => setLoading(false));
        }
    }

    React.useEffect(() => {
        if (!open) {
            setOptions([]);
        }
    }, [open]);

    return (
        <Autocomplete className="Autocomplete-container" filterOptions={(options) => options}
            id="userSearch"
            sx={{ width: 300 }}
            open={open}
            onOpen={() => {
                setOpen(true);
            }}
            onClose={() => {
                setOpen(false);
            }}
            isOptionEqualToValue={(option, value) => option.username === search.username}
            getOptionLabel={(option) => option.username}
            options={options}
            loading={loading}
            renderInput={(params) => (
                <TextField
                    {...params}
                    size="small"
                    onChange={onChange}
                    name="input"
                    value={search.input}
                    InputProps={{
                        ...params.InputProps,
                        endAdornment: (
                            <React.Fragment>
                                {loading ? <CircularProgress className="load-icon" color="inherit" size={20} /> : null}
                                <SearchIcon className="search-icon"/>
                            </React.Fragment>
                        ),
                        style: {padding:'5px'}
                    }}
                />
            )}
        />
    );
}

export default AutocompleteUserSearch;