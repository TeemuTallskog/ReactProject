import SearchIcon from '@mui/icons-material/Search';
import {useState} from "react";
import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';
import CircularProgress from '@mui/material/CircularProgress';
import * as React from 'react';
const axios = require('axios');



function AutocompleteUserSearch(){
    const [open, setOpen] = React.useState(false);
    const [options, setOptions] = React.useState([]);
    const loading = open && options.length === 0;
    const [search, setSearch] = useState({});

    React.useEffect(() => {
        let active = true;

        if (!loading) {
            return undefined;
        }

        (async () => {
            const response = await axios.get('http://localhost:8080/users',{ params: { username: search.input }});
            if (active) {
                console.log(response);
                setOptions([...response.data.users]);
            }
        })();

        return () => {
            active = false;
        };
    }, [loading, search]);

    const onChange = (e) => setSearch({...search, [e.target.name]: e.target.value})

    React.useEffect(() => {
        if (!open) {
            setOptions([]);
        }
    }, [open]);

    return (
        <Autocomplete
            id="userSearch"
            sx={{ width: 300 }}
            open={open}
            onOpen={() => {
                setOpen(true);
            }}
            onClose={() => {
                setOpen(false);
            }}
            isOptionEqualToValue={(option, value) => option.username === value.username}
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
                                {loading ? <CircularProgress color="inherit" size={20} /> : null}
                                <SearchIcon/>
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