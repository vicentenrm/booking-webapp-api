export const CodeUtils = {
  async genCode(n:any){
    const response = await new Promise(async (resolve, reject) => {
      let randomString = '';
      let characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'; //'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  
      for ( let i = 0; i < n; i++ ) {
        randomString += characters.charAt(Math.floor(Math.random()*characters.length));
      }
      resolve(randomString);
    });
    return response;
  }
}