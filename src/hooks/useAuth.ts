import { useState, useEffect } from 'react';
import { User } from '../../types/client/contexts';

function useAuth(): [User | undefined, boolean] {
    let [user, setUser] = useState<User>();
    let [finished, setFinished] = useState(false);

    useEffect(() => {
        const validate = async () => {
            let res = await fetch('/api/user/validate', {
                method: 'post',
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({uuid: localStorage.getItem('uuid')}),
            })
            .then(dat => dat.json());
            
            if (res.success) {
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

        validate();
    }, []);

    return [user, finished];
}

export default useAuth;