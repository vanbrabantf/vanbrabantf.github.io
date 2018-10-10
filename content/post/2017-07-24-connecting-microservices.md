---
date: "2017-07-24T00:00:00Z"
excerpt: Microservices can solve a lot of architectural problems, and sometimes create
  a few fun new ones. A big problem however is connecting these services to each other.
  Can GRPC lend a hand here?
featured: /assets/posts/2017-07-24-grpc/header.jpg
title: Connect microservices with the help of GRPC
tump: /assets/posts/2017-07-24-grpc/tump.jpg
---

Microservices are all the rage these days. Luckily underneath the hype there are some great use cases for them. If you’re splitting up a monolith codebase into smaller specialised chunks, extracting a long running queue to its own system, or even using particular pieces of code in a different programming language. You always have to solve one architectural problem. How do I make these things talk to each other.

Your first reflex might be a collection of REST api’s. Put them in a network with filtered ip’s, or any other way to secure it, and call it a day. But if we take a step back and look at this setup, is REST really the best way to go about it?

Don’t get me wrong, I love REST. But in this case should we be thinking in terms of resources? If we take a system that crops avatars for example. You would get something like this

{{< highlight "linenos=table" >}}
PATCH images/4
{
    "width": 400,
    "height": 200
}
{{< / highlight >}}

This doesn't really feel right. We aren't dealing with resources here but more with actions on data.

Fortunately we aren’t the first ones to ponder on this.

## Enter RPC

Some of you might have had a shiver run down your back when reading that title. RPC is commonly linked to older systems and even worst: linked to SOAP (shiver nr.2).

The reason you might not have great experiences with these setups is, ironically, for the same reason we described above. They have been misused to fit architecture they aren’t designed for. RPC is actually perfect for the use case above.

For the people not familiar with RPC, let me give a quick overview: It stands for Remote procedure call. And is, as the name suggests, a way to call procedures on a remote system. The REST call we made earlier would look like this:

{{< highlight "linenos=table" >}}
POST images.crop-image
{
    "id": 4,
    "width": 400,
    "height": 200
}
{{< / highlight >}}

Or

{{< highlight "linenos=table" >}}
POST cropImage
{
    "id": 4,
    "width": 400,
    "height": 200
}
{{< / highlight >}}

You treat your external API as an internal API. Parameters for the endpoint are attached in the body of the call. And that gives some weird results sometimes. In the case of RPC, Verbs don't really matter. If you want to fetch a user for example, it could look like this:

{{< highlight "linenos=table" >}}
POST displayUser
{
  “Id”: 4
}
{{< / highlight >}}

Or

{{< highlight "linenos=table" >}}
GET displayUser?id=4
{{< / highlight >}}

If you’re an avid REST supporter and never worked with RPC before, this all looks very strange. Maybe even dirty. I personally don’t like public RPC API’s, but in very specific cases they might be useful. If your API is more like an application that does actions on data, instead of managing data, it can make sense. (Just remember that this is not an excuse for letting your internal architecture bleed into your API).

Knowing this, we can look at our microservices in the same light. Here we have small applications that might benefit more from the RPC style of calling methods than the REST style of altering resources.

A nice end goal for our microservices might be to use them in our code, without knowing that they are remote. Let me better explain this with an example.

{{< highlight php "linenos=table" >}}
<?php

public function mailUsers(Message $message)
{
    $users = $this->userRespository->getUsers();
    MailService::SendToUsers($users, $message);
}
{{< / highlight >}}

It would be great if we could use code like this to communicate to a remote service. The `Mailservice` would be an abstraction that takes the method `SendToUsers` dynamically from the microservice.

In that way, when you update the API of the microservice, you would not need to update the `Mailservice` code. The client would automaticlly have access to the new methods.

Of course that would take a lot of work to create. You would have to write some sort of transformer, create something that can login to the service, and eventually POST the data…

## GRPC

There is another company with the same issues as us. Ok maybe not exactly the same issues as us, cause they are maybe a bit bigger. Google created a system called Stubby that connects most of their services together. When Stubby got a rewrite, Google decided to create a new system. Not closely matching their infrastructure and even made it open-source. This new system is called [GRPC](https://grpc.io/).

GRPC is a RPC framework that does a lot of heavy lifting for you. First of all, it handles all the load balancing, tracing, health checking and authentication functions you would otherwise have to write yourself. It can even go full async. But that is not even the coolest part. It also writes all the code for the connection.

### Let’s take a look at how it works

If you want to execute methods on a remote system as if they were present in your current system, you will have to transform the data. You have no idea what the server is expecting. The server on the other side would want to have that data serialized as well. This is also a great place to add some validation on that data.

To tackle serialization and validation Google created something called protocol buffers. These protocol buffers rely on proto files that tell them what data is coming in and out. This system is somewhat comparable to systems like [Swagger](https://swagger.io) and [Blueprint](https://apiblueprint.org/). Unlike these, proto files are less human readable and look at bit more like code. And pack a lot more functionallity than just documentation.

Here is an example of one of those proto files:

{{< highlight proto "linenos=table" >}}
syntax = "proto3";

package tutorial;

message Person {
	
    required string name = 1;
    required int32 id = 2;
    optional string email = 3;
	
    enum PhoneType {
        MOBILE = 0;
        HOME = 1;
        WORK = 2;
    }
}
{{< / highlight >}}

As you can see they have a C/Java style and more importantly, are strictly typed. The numbers that are assigned to these variables are id’s for the system itself. Please note that these files are allowed to have a bit of logic in them making them very flexible. You can look at them as value objects.

Once you have created the Proto file, the real magic happens. Now you are able to generate the connection between the systems. I say generate, because it is exactly like that. GRPC can now automatically generate an SDK that you can import in your client and server. This SDK uses the mapping to act as regular methods calls in your current code base.

You can find some examples of generated code on the [GRPC github](https://github.com/grpc/grpc/tree/master/examples/php)

### Why would I want protobuffers over something like JSON?

We now know on a high level how GRPC works, but we still haven’t talked about how the data is actually transmitted. The downside here is that unless you dive really deep, this will all be a bit blackbox-ish.

Protobuffers aren’t really designed to be human readable, they are compressed binaries. I know this might be a huge turn off, but it does has its advantages. These come mainly in the form of its small footprint and speed.

Yogesh Shinde posted an article on [Dzone](https://dzone.com/articles/protobuf-performance-comparison-and-points-to-make) on the comparison between JSON and protobuffers that suggested that the later are almost double as fast.

[Bruno Krebs](https://twitter.com/brunoskrebs)’s article [Beating JSON performance with Protobuf](https://auth0.com/blog/beating-json-performance-with-protobuf/) even sported cases that were up to 6 times the speed.

### And what are the big downsides?

Everything comes at a price, and GRPC is no exception. The biggest downside is obviously the black box connections. They are hard to debug and you’re not ever really sure about what’s transmitted.

The generated code is also a bit of a double edged sword. Lots of people have had some bad experiences with generated code (for good reasons). But to be honest, I  feel that in this case it’s not that bad. The generated code are mostly value like objects that sometimes are little more than getters and setters and it does allow you to generate SDK’s in loads of different languages with a single click, so that is a decision you have to make for yourself.

I also found the set up a bit hard. In the case of PHP they suggest you install using PECL what is not really ideal (There is a composer option as wel). You also need to run a Node server so that might not jive all that well with your current setup.

## Conclusion

This might all seem a bit daunting to set up if you only have 1 or 2 microservices in your domain. But if your product is a collection of different microservices, you might save some time and performance with this technology. Especially if there are a few different programming languages mixed in.

But be sure to create a pilot project before you take the plunge.

