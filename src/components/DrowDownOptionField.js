import {useEffect, useState} from "react";
import UserCard from "./UserCard";
import '../resources/css/autocompleteSearchBar.css';
import LinearProgress from '@mui/material/LinearProgress';

function DrowDownOptionField(props){
    const [options, setOptions] = useState([]);
    const [existingUser, setExistingUser] = useState([]);
    const [filtered, setFiltered] = useState([]);

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