import { UserProfile } from "@/components/UserProfile"

var UserData = (function() {
    var users: UserProfile[] = []
    var currentUser: UserProfile = UserProfile.guestUser();

    var createUser = function(email: string, hash: string) {
        var newUser: UserProfile = new UserProfile(email, hash);
        users.push(newUser);
    }
  
    var getEmail = function() {
      return currentUser.getEmail();    // This will be changed to a db call
    };

    var getUserByEmail = function (email: string): UserProfile{
        for (var user of users){
            if (email == user.getEmail()){
                return user;
            }
        }
        throw new ReferenceError(`User ${email} not found`)
    }
    
    var login = function(email: string, hash: string): boolean{
        var user = getUserByEmail(email);
        if (user.validateLogin(email, hash)){
            currentUser = user;
            return true;
        } else {
            return false;
        }
    }

    var logout = function(){
        currentUser = UserProfile.guestUser();
    }
  
    return {
        createUser: createUser,
        getEmail: getEmail,
        getUserByEmail: getUserByEmail,
        login: login,
        logout: logout
    }
  
  })();
  
  export default UserData;