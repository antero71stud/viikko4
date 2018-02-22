const dummy = (blogs) => {
    return 1
}

const totalLikes = (blogs) => {
    const reducer = (sum, blog) => {
        console.log('sum ',sum)
        console.log('likes ',blog.likes)
        return sum + blog.likes
    }
    return blogs.reduce(reducer, 0)
}

module.exports = {
    dummy,
    totalLikes
}