import {useEffect, useState} from "react";
import UserCard from "./UserCard";
import '../resources/css/autocompleteSearchBar.css';
import LinearProgress from '@mui/material/LinearProgress';

/**
 * creates a dropdown with user cards and filters them according to the search term
 * @param props
 * @returns {JSX.Element}
 * @constructor
 */
function DrowDownOptionField(props){
    /**
     * {options} array of loaded usercards
     * {existingUser} user id's of already loaded cards
     * {filtered} array of filtered usercards shown to the user
     */
    const [options, setOptions] = useState([]);
    const [existingUser, setExistingUser] = useState([]);
    const [filtered, setFiltered] = useState([]);

    /**
     * creates user cards when parent component loads new options
     */
    useEffect(() =>{
        props.options.map((item) => {
            if(!existingUser.includes(item.user_id)){
                setOptions([...options, <li key={item.username + item.user_id}><UserCard user={item}/></li>])
                setExistingUser([...existingUser, item.user_id]);
            }
        });
    }, [props.options])

    useEffect(() => {
        setFiltered([filteredList(props.search)]);
    }, [props.search, options])

    /**
     * filters options array according to search string
     * @param search string
     * @returns {*[]} filtered array of usercards according to the search param
     */
    const filteredList = (search) =>{
        if(options.length > 0){
            return options.filter(item =>{
                return item.key.toLowerCase().indexOf(search.toLowerCase()) > -1;
            })
        }else{
            return [];
        }
    }

    return(
        <div className="dropdown-options-container">
        {filtered[0] && filtered[0].length>0 ? (<ul style={{listStyle: 'none', paddingLeft: '0'}}>{filtered}</ul>) : (<LinearProgress className="linear-progress-bar" color="inherit"/>)}
        </div>
    )
}

export default DrowDownOptionField;