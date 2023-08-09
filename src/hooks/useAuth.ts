import { useState, useEffect } from 'react';
import { User } from '../../types/client/contexts';

function useAuth(): [User | undefined, boolean] {
    let [user, setUser] = useState<User>();
    let [finished, setFinished] = useState(false);


    useEffect(() => {
        console.log("BUNGO");
        const validate = async () => {
            console.log("BUNGOStray");
            let res = await fetch('/api/user/validate', {
                method: 'post',
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({uuid: localStorage.getItem('uuid')}),
            })
            .then(dat => dat.json());

            console.log(res);
            if (res.success) {
                console.log("BUNGOStrayDogs");
                let {userid, email, username} = res.user;

                setUser({
                    ...user,
                    userid,
                    email,
                    username
                });
            }

            setFinished(true);
        } 

        console.log('true?');
        validate();
    }, []);

    return [user, finished];
}

export default useAuth;