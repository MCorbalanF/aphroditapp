

///relationship dash
export const  dash = {};



export const arrayFriend = Array.from({ length: 3 }, (_, index) => ({
    id:index+1620,
    name: `Friend ${index+1}`,
    avatar: `https://picsum.photos/id/${index + 10}/100/100`,
}));

export const arrayLove = Array.from({ length: 3 }, (_, index) => ({
    id:index+6358,
    name: `Love ${index+1}`,
    avatar: `https://picsum.photos/id/${index + 10}/100/100`,
}));


export const user = {
    name:'CacheteBienDado69',
    avatar: `https://picsum.photos/id/600/100/100`,
    relationships:{
        friends:[...arrayFriend],
        love:[...arrayLove]
    }


};
