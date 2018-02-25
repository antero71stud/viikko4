const dummy = (blogs) => {
  return 1
}

const totalLikes = (blogs) => {
  const reducer = (sum, blog) => {
    //console.log('sum ',sum)
    //console.log('likes ',blog.likes)
    return sum + blog.likes
  }
  return blogs.reduce(reducer, 0)
}

const favoriteBlog = (blogs) => {

  var maxLikes = ( max,cur) => Math.max(max,cur)

  const formatBlog = (blog) => {
    //console.log('format blog ',blog)
    //console.log('blog.title ',blog[0].title)
    return {
      title: blog[0].title,
      author: blog[0].author,
      likes: blog[0].likes
    }
  }

  var numberOfLikes = blogs.map( blog => blog.likes)
    .reduce(maxLikes,0)

  const blog1 = blogs.filter(a => a.likes===numberOfLikes)

  //console.log('blog1 ',blog1)
  return formatBlog(blog1)
}

module.exports = {
  dummy,
  totalLikes,
  favoriteBlog
}