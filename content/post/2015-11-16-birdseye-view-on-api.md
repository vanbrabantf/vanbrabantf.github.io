---
layout: post
title:  "A bird's eye view on API development"
date: 2015-11-16
excerpt: "So you want to build a web API. You have to start somewhere, why not here"
featured: "/assets/posts/2015-11-16-birdseye-view-on-api/header.png"
tump: "/assets/posts/2015-11-16-birdseye-view-on-api/tump.png"
---

**This post wast orignially posted on the [madewithlove](https://blog.madewithlove.be/) site**

> So an API, that's just output of some JSON code right? No problem, my framework does that automatically.

Or if you just want an overview on some best practices, conventions and nifty ways people have done stuff before, this post has you covered.


We won't go in much detail about source code here. This article is language agnostic, whether you use PHP, Ruby, Velato or some obscure Javascript framework you can happily follow along. Please note that not everything here is law, some parts (maybe everything) are open for discussion. Lastly: some of this may be pretty obvious, you are probably right. But I rather cover all the bases.

## So what are web APIs all about

Application Programming Interface, or as the cool kids call it: API, is a collection of endpoints to interact with an application. You have internal and external APIs. This post is all about external APIs (more specific, external web APIs). Some people like to think about APIs as a wrapper around a database, this is however mostly not the case. But they tend to serve (mostly) the same purpose: interacting with data.

APIs can be widely different in architecture (XML-RPC, REST, SOAP, ...) and data structure (XML, JSON), but it's very important that they stay as consistent as possible. Today we're gonna focus on REST.

## REST

Stands for  Representational State Transfer (don't worry, there won't be a quiz) and is the most commonly used (and modern) architecture for handling APIs. REST doesn't rely on coupling to the rest of the application like protocols as SOAP tend to do (do note that REST is not a protocol) making it fast and easy to implement.

The basics of REST aren't that hard to grasp, although there is a lot of misunderstanding on the internet about it.
Rest is a resource based architecture that is stateless. This means that a REST resource (the data) can't have sessions nor cookies. The data itself is represented in media types like XML and JSON. It's a common pitfall to think that RESTful APIs are [JSON](https://twitter.com/PHP_CEO/status/435105782829305857) only.

REST commits to a uniform interface. In most cases this is HTTP as they fit nicely together. However be careful, another common pitfall is to think that HTTP and REST are interwoven. REST isn't necessarily connected to HTTP even though in practise it usually is.

So what does that exactly mean, committing to a uniform interface? This is easily explained with the HTTP protocol:

## HTTP and REST

Hypertext Transfer Protocol (another acronym, this post would be a great drinking game) is something you probably already know. You are using it right now, as you are using it in your browser to surf the Internet (a relative new hype).

HTTP is request/response driven, this means that a response only is given as a request is made. There is no constant stream of data (sockets).

In the case of REST we are mainly interested in its interface. In HTTP the client sends verbs in the header of request, the server responses with HTTP codes in its response header. Now this is one of the hard parts about building an API, what verb fits with what action and/or what response code should be send. As far as the verbs go, only the edge cases are difficult, the response codes on the other hand are often open for discussion. So let's have a quick look at some commonly used ones shall we (please note that these are the most used ones, there are more):

| Verb   | Return HTTP Code| Example of url  |
| -------|:---------------:| ---------------:|
| GET    | 200             | /wombats        |
| GET    | 200             | /wombats/1      |
| POST   | 201             | /wombats        |
| PUT    | 200             | /wombats/1      |
| DELETE | 200             | /wombats/1      |

### The GET verb

It kinda does what it says on the tin. It GETs a resource. It can fetch individual resources or a collection (We'll take a closer look on how this is displayed later in the post). On success this endpoint returns a 200 (see http codes) with the resource (or collection of resources) in its body.

### The POST verb

This verb asks the server to accept the resource included in the post. You mainly know this outside of APIs as forms. It's commonly used to add new resources to a collection. For example If you were to post to ```animals/wombats``` you would create a new wombat not a new animal. If the endpoint creates a resource that isn't covered in the API (not everything needs an endpoint) it should return a 204 No ContentHTTP status code (success, empty response), or a 201 Createdresponse which should contain the created resource and optionally a location header where the new resource can be found.

Now what do I mean with a "creating a resource on an  endpoint that isn't covered in the API" ?
This would be an endpoint that has no reference GET endpoint. Simply put, something you only want to send to the server but never return to the client.

### The PUT verb

The PUT verb is like the POST verb used to send data. The main difference here is that POST creation is done on the collection, PUT creation is done on a resource URI (POST: ```animals/dogs``` PUT ```animal/dogs/1```). PUT can also be used to alter a resource. Executing the same PUT request multiple times should only create or alter the resource once: its action should be [idempotent](https://www.youtube.com/watch?v=6dVNdFwqeKs). If you do this than please be sure to inform the client of what happened, nothing is worse then getting non-sensical HTTP codes (except the new Star-Trek movies). So if you just update the resource, you should return a 200 or 204 HTTP code and an empty body. If you end up creating a new resource, you just follow the POST flow.

#### The PATCH verb

This one is a bit special, It's often confused with the PUT verb as it (mostly) performs the same function: updating resources. So why have two verbs that do the same thing? The answer is, they don't and you shouldn't probabily use this verb (unless you really know what you're doing). According to the [RFC](https://tools.ietf.org/html/rfc5789) a PATCH request should contain instructions on how to partially update a resource.

You can find more info (and examples on how a PATCH request looks) here: [REST API - PUT vs PATCH with real life examples](http://stackoverflow.com/questions/28459418/rest-api-put-vs-patch-with-real-life-examples)

Update: [William Durand](https://twitter.com/couac) [informed me](https://twitter.com/couac/status/667409903884046336) that you should always add the header ```Content-Type: application/partial-update-json``` when you do a partial update through PATCH.
More info can be found here: [media type for partial JSON updates?](http://www.ietf.org/mail-archive/web/apps-discuss/current/msg03991.html)

### The DELETE verb

Another simple one, it deletes stuff. This needs to point at a specific endpoint (like a PUT) and returns a 200 HTTP code.

### How to build your urls

It's very important to have a consistent API, a huge part of this is the consistency of your urls. Don't worry, if you just follow a few simple guidelines you'll be allright.

First of all, it's best to use [nouns instead of verbs](http://apigee.com/about/blog/technology/restful-api-design-nouns-are-good-verbs-are-bad). This is a simple way to enforce consistancy in your naming scheme.
Secondly you should always use the plural form. so use ```animals/dogs``` instead of ```animal/dog```.
Thirdly you should think in terms of your API, not in terms of your database. Your client doens't need to know about the structure of your data model.

### HTTP CODES

A very important part of an API is informing clients about what just happened. In HTTP this is solved with HTTP codes returned in the header of the response. We have seen a couple of them appear above, so what are they? Well they are indexes to a list of commonly used responses a server (or [teapot](https://sitesdoneright.com/blog/2013/03/what-is-418-im-a-teapot-status-code-error)) could give.

They can be found here: [List of HTTP status codes](https://en.wikipedia.org/wiki/List_of_HTTP_status_codes) or [here in a more academic way](https://http.cat/).
As stated before, sometimes it's hard to see what code fits what use case. These are often fun points of discussion while stargazing on a first date.

### HATEOAS

Hypertext As The Engine Of Application State (acronym, drink) is a big part of REST. Its purpose is to add discoverability to your API. You can compare this to hyperlinks on regular websites. For example: imagine a Twitter feed, it consist of a long list of tweets sent by users. if you click on a tweet you get a detailed view of the tweet with all its responses. This is comparable with the HATEOAS structure. You attach a link to each entity in a collection, this link points to the endpoint of the specific resource.

Why is this handy? In theory this allows dropping separate documentation. You don't have to document all your endpoints, the endpoints provide them themselves. In practice I would advise to always provide separate documentation. A great workflow here is [Api Blueprint](https://apiblueprint.org/) documentation with automated [Dredd](https://dredd.readthedocs.org/en/latest/) testing on top of it to make sure your documentation is never out of date.

## Data structure

This is the part things get a little fuzzier. Not only are there different content types out there (XML, JSON), even those tend to have different structure standards. This part of the article is more about what's out there, instead of what you should use. The most important thing you should remember is the scope of your application. Even though it's good practice to return both in XML and JSON (through the Accept header), it can prove to be beyond the scope of your API to do so.

As most people prefer the JSON format (as do I), we shall take a look at the different structure standards (loose term). People tend to get pretty defensive on what standard they pick, this happens because when you pick one, you're stuck with it. You can't just decide to adopt a new structure, even in a new API version, I would not advise it.

### JSON API

{{< highlight json "linenos=table" >}}
{
  "links": {
    "self": "http://example.com/articles",
    "next": "http://example.com/articles?page[offset]=2",
    "last": "http://example.com/articles?page[offset]=10"
  },
  "data": [{
    "type": "articles",
    "id": "1",
    "attributes": {
      "title": "JSON API paints my bikeshed!"
    },
    "relationships": {
      "author": {
        "links": {
          "self": "http://example.com/articles/1/relationships/author",
          "related": "http://example.com/articles/1/author"
        },
        "data": { "type": "people", "id": "9" }
      },
      "comments": {
        "links": {
          "self": "http://example.com/articles/1/relationships/comments",
          "related": "http://example.com/articles/1/comments"
        },
        "data": [
          { "type": "comments", "id": "5" },
          { "type": "comments", "id": "12" }
        ]
      }
    },
    "links": {
      "self": "http://example.com/articles/1"
    }
  }]
}
{{< / highlight >}}

This is my favourite, so it's first. I've taken the liberty of trimming the example found on the site ([http://jsonapi.org/](http://jsonapi.org/)). As you can plainly see, this includes lots of data. On closer inspection you might notice that the "real" data is kind of small compared to the entire response (this is a very verbose example). This is due to a very heavy usage of HATEOAS.

The response starts with a ```links``` object, this is a nice way to implement pagination. It's pretty easy to write a recursive function to consume this endpoint (and you can reuse it for all endpoints).

Then follows the data object, which contains an array (if this were an endpoint to a specific entity, it would not use an array) to display the different articles (in this case only one).

The relationships are pretty self explanatory. these are HATEOAS links to related endpoints.

### JSend

{{< highlight json "linenos=table" >}}
{
  "status": "success",
  "data": {
    "post": {
      "id": 1,
      "title": "A blog post",
      "body": "Some useful content"
    }
  }
}
{{< / highlight >}}
Simple and to the point, what's not to like? Well there is no HATEOAS, that's kind of a bummer. Still, if you are making a small application (or maybe some AJAX calls), that would not be the disastrous. As stated before, it all depends on the scope of your application.

### OData JSON Protocol

{{< highlight json "linenos=table" >}}
{
    "@odata.context": "serviceRoot/$metadata#People",
    "@odata.nextLink": "serviceRoot/People?%24skiptoken=8",
    "value": [
        {
            "@odata.id": "serviceRoot/People('russellwhyte')",
            "@odata.etag": "W08D1694BD49A0F11",
            "@odata.editLink": "serviceRoot/People('russellwhyte')",
            "UserName": "russellwhyte",
            "FirstName": "Russell",
            "LastName": "Whyte",
            "Emails": [
                "Russell@example.com",
                "Russell@contoso.com"
            ],
            "AddressInfo": [
                {
                    "Address": "187 Suffolk Ln.",
                    "City": {
                        "CountryRegion": "United States",
                        "Name": "Boise",
                        "Region": "ID"
                    }
                }
            ],
            "Gender": "Male",
            "Concurrency": 635404796846280400
        },
        {
            "@odata.id": "serviceRoot/People('keithpinckney')",
            "@odata.etag": "W08D1694BD49A0F11",
            "@odata.editLink": "serviceRoot/People('keithpinckney')",
            "UserName": "keithpinckney",
            "FirstName": "Keith",
            "LastName": "Pinckney",
            "Emails": [
                "Keith@example.com",
                "Keith@contoso.com"
            ],
            "AddressInfo": [],
            "Gender": "Male",
            "Concurrency": 635404796846280400
        }
    ]
}
{{< / highlight >}}

Now you might look at this and think: Wtf...
And you would be right. This is a difficult to understand standard and is probably not something you wanna use as it's not really compatible with REST. OData requires endpoints that get created dynamically (called out-of-band information). it also demands that you create an endpoint named ``` /$metadata``` to decipher the metadata in the response.

This Structure seems a bit out there and requires not only some extra work to implement, it also requires some really great documentation.

I would only recommend it if you really need it, and know what you are doing. (Even then HAL would still be a better option)

### HAL
{{< highlight json "linenos=table" >}}
{
    "_links": {
        "self": { "href": "/orders" },
        "curies": [{ "name": "ea", "href": "http://example.com/docs/rels/{rel}", "templated": true }],
        "next": { "href": "/orders?page=2" },
        "ea:find": {
            "href": "/orders{?id}",
            "templated": true
        },
        "ea:admin": [{
            "href": "/admins/2",
            "title": "Fred"
        }, {
            "href": "/admins/5",
            "title": "Kate"
        }]
    },
    "currentlyProcessing": 14,
    "shippedToday": 20,
    "_embedded": {
        "ea:order": [{
            "_links": {
                "self": { "href": "/orders/123" },
                "ea:basket": { "href": "/baskets/98712" },
                "ea:customer": { "href": "/customers/7809" }
            },
            "total": 30.00,
            "currency": "USD",
            "status": "shipped"
        }, {
            "_links": {
                "self": { "href": "/orders/124" },
                "ea:basket": { "href": "/baskets/97213" },
                "ea:customer": { "href": "/customers/12369" }
            },
            "total": 20.00,
            "currency": "USD",
            "status": "processing"
        }]
    }
}
{{< / highlight >}}

Looks familiar? It's basically OData with HATEOAS support. I would choose this over OData (and not only because [2001: A Space Odyssey](http://www.imdb.com/title/tt0062622/) is one of my favourite movies).

### Other options

As stated before, These are just a few options. It's not a crime to adapt these to your business cases or create a [brand new standard](http://xkcd.com/927/). Maybe combine JSend with HATEOAS ?

## Authentication

As you guys know REST is stateless (no sessions or cookies for you). So how can we limit users so they only can access the content they are allowed to access? No worries, smart people have already found some smart solutions to this problem. Again which one to choose is up to you and your application (even though OAuth2.0 is currently preferred)

### HTTP Basic

This one is the easiest one to implement. It's the standard HTTP way of authentication. That said, it's also the least secure option out there (never use this over non SSL/HTTPS connections!).

To log a user in, the client just needs to send a Basic header with a base64 encoding of username:password.

That's it. Now every sequential call you do, you just have to send that data with it.

### JSON Web Tokens

A JWT looks like this: aaa.bbb.ccc. It's just a long string divided in 3 sections, separated with a dot (.). The first section is a header, second one is the payload and the last one is the signature. For more information about how to build token I recommend reading [this guide](https://scotch.io/tutorials/the-anatomy-of-a-json-web-token#what-does-a-jwt-look-like?).

The basic JWT flow goes like this: You send your credentials to a login endpoint. The endpoint returns a JWT token with your data in it. Now you just have to send that token with every request like this:

{{< highlight "linenos=table" >}}
Authorization: Bearer PlaceTokenHere
{{< / highlight >}}

Most JWT's have expiry dates, This kind of authentication method has no refresh system. When it expires you just have to request a new one.

### OAuth2

This is the most popular Authentication method. This is mainly due to it's security and flexibility. That said, it can be a little bit of PITA  to set it up.
Covering the entire OAuth spectrum would take us too far I'm afraid. I'll just cover a very simplistic practical flow.

In it's most simplistic form there are some similarities between JWT and OAuth. They both request a token in the same way and they both get a token returned (In this case obviously an OAuth token and not a JWT).

OAuth requires that you send the token with it on each request as well:

{{< highlight "linenos=table" >}}
Authorization: Bearer PlaceTokenHere
{{< / highlight >}}

OAuth tokens always have an expiry date, when this happens you have to use the refresh token (it's part of the response you get when receiving your OAuth token) on the refresh endpoint to get a new OAuth token.


This is a very simplistic representation of retrieving an OAuth token, I'm affraid the differences between OAuth and JWT would take us too far. I encourage you to read more about it here: [http://oauthbible.com/](http://oauthbible.com/).


## Versioning

The older your API gets, the more prone your API is to change. How we deal with this change can be tricky for end users. You can't just remove or change endpoints, there are probably some people that rely on the old structure of your API. You don't need to support older versions of your API indefinitely, but it would be common decency to give people time to migrate to the new structure.

As you can imagine, everyone has an opinion on how versioning should be done. Let's look at a few common ones.

### Url based versioning

This looks like the most obvious solution, but it's not necessarily the best one. This way of versioning requires some foreknowledge and planning. You have to design your first version of the API with the possibility in mind that future versions of the API are coming. This sounds obvious, but API versioning is commonly an afterthought.

A url based versioning url might look like this:

{{< highlight "linenos=table" >}}
/api/v3/headis/players
{{< / highlight >}}

### Header based versioning

This way is commonly described as the "best" way. Of course the reality is that there is no best way. And it all depends on your use case (can't stress that enough).

Header based versioning is done trough, well you guessed it, a header. More specifically, the Accept header.
Looks like this:

{{< highlight "linenos=table" >}}
Accept: application/vnd.github.v3+json
{{< / highlight >}}

If no version header is given, you simply return your latest version.

## Conclusion

This is of course the tip of the iceberg. We just had a bird's eye view over API development. The key thing to remember here is that almost every problem with APIs has occurred to someone before and it's important to be aware of what the possible directions are with every crossroad you encounter. Just don't forget that there is no such thing as "the one true way".

### Further reading

- [Phil Sturgeon's great Build APIs you won't hate](https://apisyouwonthate.com/)
- [Apigee's Crafting Interfaces that Developers Love (Free)](http://apigee.com/about/resources/ebooks/web-api-design)
- [The O'reilly book (By Leonard Richardson, Mike Amundsen, Sam Ruby)](http://shop.oreilly.com/product/0636920028468.do)




![](http://imgs.xkcd.com/comics/api.png)

Image by Randall Munroe from his [great web comic site](http://xkcd.com/)
