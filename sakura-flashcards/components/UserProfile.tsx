
export class UserProfile {
    private user_email: string;
    private password_hash: string;

    public constructor(email:string, hash:string){
        this.user_email = email;
        this.password_hash = hash;
    }

    public static guestUser(): UserProfile{
        return new UserProfile("Guest", "");
    }
  
    public getEmail(): string {
      return this.user_email;    // This will be changed to a db call
    };
  
    private setEmail(name: string) {
      this.user_email = name; //replace with db call
    };

    private setPassword(hash: string){
        this.password_hash = hash; //replace with db call
    }

    public validateLogin(email: string, hash: string): boolean{
        return (email == this.user_email && hash == this.password_hash); //replace with db call
    }

    private changePassword(email: string, hash: string, new_hash: string){
        if (this.validateLogin(email,hash)){
            this.setPassword(new_hash);
        }
    }
}