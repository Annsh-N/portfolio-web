export type ProjectSection = {
  heading: string;
  paragraphs: string[];
};

export type Project = {
  slug: string;
  name: string;
  descriptor: string;
  status: string;
  year: string;
  languages: string[];
  repository: string;
  summary: string;
  question: string;
  facts: Array<{ label: string; value: string }>;
  sections: ProjectSection[];
};

export type Note = {
  slug: string;
  title: string;
  date: string;
  readTime: string;
  summary: string;
  paragraphs: string[];
};

export const profile = {
  name: "Annsh Navle",
  location: "West Lafayette, Indiana",
  email: "anavle@purdue.edu",
  github: "https://github.com/Annsh-N",
  linkedin: "https://linkedin.com/in/annsh-navle",
  introduction:
    "I like building things, understanding how they work, and taking ideas from a blank file to something real.",
  about:
    "I study computer science and physics at Purdue, and I like building from first principles: taking an idea from a blank file to code that actually runs. I have worked on query diagnostics at AWS, enterprise banking software, financial integrations, and research tooling. I enjoy the whole path—protocols, backends, infrastructure, and the small fun projects that keep me curious.",
};

export const experiences = [
  {
    organization: "Amazon Web Services",
    role: "Software Development Engineering Intern",
    period: "Summer 2026",
    note: "I worked on operational tooling for query and session diagnostics in Athena, tracing behavior across APIs, metadata lookup paths, and private networking.",
  },
  {
    organization: "Mindcraft Software",
    role: "Software engineering intern",
    period: "Summer 2025",
    note: "I worked across Spring and Angular on enterprise banking software, including a document-analysis workflow and a JWT-secured training system.",
  },
  {
    organization: "Indepay",
    role: "Backend engineering intern",
    period: "Summer 2024",
    note: "I built Node.js APIs around third-party financial integrations and learned that retries, token refresh, validation, and useful logs are the real shape of an integration.",
  },
  {
    organization: "American Chemical Society",
    role: "Research developer",
    period: "2023 — 2024",
    note: "I built data-collection and modeling pipelines for chemical reactivity work, then made the model's error behavior visible instead of stopping at a headline accuracy number.",
  },
];

export const projects: Project[] = [
  {
    slug: "listen-config",
    name: "Listen Config",
    descriptor: "A low-latency listening control plane for real-time voice agents.",
    status: "0.1.0 pre-release",
    year: "2026",
    languages: ["Rust", "Python", "TypeScript"],
    repository: "https://github.com/Annsh-N/listen-config",
    summary:
      "A deterministic Rust engine that turns workflow events, transcript commits, and runtime vocabulary into ordered Deepgram configuration changes before the next relevant audio.",
    question: "How do you change a live speech recognizer without letting control state and audio disagree?",
    facts: [
      { label: "audio permit", value: "41.7–43.1 ns" },
      { label: "1,000-rule selection", value: "529–532 ns" },
      { label: "latest-wins stress", value: "1M requests / 0 allocs" },
      { label: "language surfaces", value: "Rust · Python · Node.js" },
    ],
    sections: [
      {
        heading: "The problem I wanted to make explicit",
        paragraphs: [
          "Voice agents move through phases: open conversation, account-number collection, an OTP, a product name, a language switch. Each phase wants different endpointing and vocabulary. The tempting implementation is to assemble a provider message wherever the workflow changes. That leaves the application quietly responsible for inheritance, acknowledgements, ordering, reconnects, and races between a configuration write and the next audio chunk.",
          "Listen Config turns that scattered responsibility into one synchronous state machine. The host supplies typed events and provider acknowledgements. The engine returns exact control artifacts, deadlines, explanations, and one-chunk audio permits. It never owns the socket and it never copies audio; its boundary is deliberately narrow enough to reason about.",
        ],
      },
      {
        heading: "The state machine is the product",
        paragraphs: [
          "The runtime tracks desired, pending, and applied configuration separately. Only one provider operation may be pending. If three workflow changes arrive while that operation awaits acknowledgement, they do not become a queue of obsolete work; the desired target simply moves forward. When the acknowledgement arrives, the engine sends the newest required configuration.",
          "That model also gives failures a precise meaning. A rejected write can be retried. A possibly-sent write, an acknowledgement timeout, or an inconsistent provider echo makes the connection state unknowable, so the runtime requires a reconnect. Connection epochs prevent late events from an old socket from mutating the replacement session. Audio remains behind a control barrier until required control has entered the host's ordered writer.",
        ],
      },
      {
        heading: "Determinism across three languages",
        paragraphs: [
          "Policies support baselines, inherited profiles, phase overlays, vocabulary packs, language strategies, typed event predicates, transcript matchers, and temporary lifetimes. YAML, JSON, and typed Rust declarations compile to the same canonical output, with independent diagnostics and field-level provenance so a caller can ask not only what value won, but why.",
          "The Python and TypeScript packages are native bindings over the same owned Rust facade rather than reimplementations. Pressure tests cover 10,000 sessions, randomized event sequences, malformed provider frames, backpressure, fragmentation, and allocation behavior. A committed account-recovery replay drives the real compiler, trigger engine, runtime, and driver without a network key and checks the resulting state-machine trace in CI.",
        ],
      },
      {
        heading: "What I am still sharpening",
        paragraphs: [
          "The library is pre-release. Cross-platform package qualification and live provider canaries matter more now than another policy feature. The most interesting work has been learning where a library should stop: Listen Config owns deterministic control decisions, while authentication, WebSockets, audio, reconnect scheduling, and application workflow remain host concerns.",
        ],
      },
    ],
  },
  {
    slug: "http-server",
    name: "HTTP/1.1 Server",
    descriptor: "A C++20 static file server built directly on POSIX sockets.",
    status: "qualified on Linux",
    year: "2026",
    languages: ["C++20", "POSIX", "CMake"],
    repository: "https://github.com/Annsh-N/http-server",
    summary:
      "An incremental HTTP parser, persistent connection loop, bounded worker pool, path-safe file handler, absolute deadlines, graceful shutdown, and reproducible benchmark harness.",
    question: "What does a small HTTP server have to guarantee once the happy-path request is no longer enough?",
    facts: [
      { label: "small response", value: "~24.4K req/s" },
      { label: "16 KiB response", value: "~322.6 MB/s" },
      { label: "test executables", value: "11" },
      { label: "dispatch bound", value: "W + Q + 1 sockets" },
    ],
    sections: [
      {
        heading: "A protocol is mostly boundaries",
        paragraphs: [
          "I started this project to replace a vague understanding of sockets with a request lifecycle I could trace byte by byte. TCP does not deliver requests; it delivers fragments of a stream. The parser therefore keeps incomplete input, identifies exactly one message boundary, and leaves pipelined bytes available for the next parse. Persistence is safe only when that boundary is unambiguous.",
          "That led to explicit framing policy: one validated Content-Length, correct HEAD semantics, and connection closure when Transfer-Encoding and Content-Length compete. Header, body, file, and request-count limits are part of correctness, not hardening added later.",
        ],
      },
      {
        heading: "Ownership before concurrency",
        paragraphs: [
          "Each descriptor lives in a move-only RAII type. The acceptor either owns it, moves it into one bounded queue slot, or a worker moves it into a stack-owned Connection. There is no state in which two parts of the program believe they will close the same socket. With W workers and queue capacity Q, the application owns at most W + Q + 1 client descriptors; the extra one may be held by a blocked acceptor.",
          "Blocking on a full queue is intentional backpressure. Pressure propagates from workers to dispatch, then to accept, and finally to the kernel listen backlog. Close-and-drain shutdown wakes blocked producers and consumers, finishes accepted work, and joins every worker. A self-pipe moves SIGINT and SIGTERM handling out of the async-signal-unsafe handler and back into normal server code.",
        ],
      },
      {
        heading: "The benchmark changed the story",
        paragraphs: [
          "On an M2 Pro loopback workload, throughput reaches roughly 24.4K small responses per second at 16 connections and stays almost flat as concurrency rises. Tail latency does not stay flat: p95 grows from tens to hundreds of milliseconds as offered concurrency exceeds the four-worker execution width. More clients were becoming queueing, not useful work.",
          "That result is more valuable than a peak number because the repository keeps the workload, warmup, duration, machine, commit, raw outputs, and percentile aggregation. The server also reports a final structured snapshot of accepted, queued, completed, timed-out, rejected, and failed work without putting synchronized logging on the request hot path.",
        ],
      },
      {
        heading: "Why I keep it small",
        paragraphs: [
          "The server does not try to become a general web framework. Its job is to make parsing, ownership, overload, filesystem containment, deadlines, and shutdown visible enough to test. The next useful comparison is on the deployment VPS, where the network, kernel, and machine differ from the loopback development baseline.",
        ],
      },
    ],
  },
  {
    slug: "build-orchestrator",
    name: "Build Orchestrator",
    descriptor: "A deterministic local build engine written in Go.",
    status: "local engine complete",
    year: "2026",
    languages: ["Go", "JSONL", "SHA-256"],
    repository: "https://github.com/Annsh-N/build-orchestrator",
    summary:
      "Loads a declared target DAG, validates its invariants, plans deterministic parallel stages, derives dependency-aware cache keys, and executes local work with bounded parallelism.",
    question: "Can a build engine stay deterministic while finding all the parallel work the graph permits?",
    facts: [
      { label: "benchmark graph", value: "10,000 targets" },
      { label: "planner median", value: "62.9–66.4 ms" },
      { label: "allocation reduction", value: "~18%" },
      { label: "trace format", value: "structured JSONL" },
    ],
    sections: [
      {
        heading: "The graph has to earn trust first",
        paragraphs: [
          "Build systems are appealing because they combine graph algorithms with messy operating-system reality. I began with the graph instead of remote workers: strict JSON loading, duplicate detection, missing dependencies, cycle detection, normalized target definitions, and a deterministic Kahn-style topological plan.",
          "A valid plan is split into stages whose targets may run in parallel. Stable ordering means the same input graph produces the same plan and trace, which is important for debugging and for tests that should not fail because map iteration happened to change.",
        ],
      },
      {
        heading: "Incrementality is an ownership problem too",
        paragraphs: [
          "Cache keys include declared source content, target configuration, environment, and dependency keys. A cache hit is accepted only when metadata matches and declared outputs still exist. Targets without declared outputs always execute. This avoids pretending that an old metadata record proves the filesystem is still in the expected state.",
          "The executor bounds local parallelism and captures stdout, stderr, exit status, duration, and lifecycle events. Failure causes downstream targets to be skipped rather than launched with missing prerequisites. JSONL traces record planned, cache-hit, started, finished, failed, and skipped events without tying the engine to one UI.",
        ],
      },
      {
        heading: "Measuring the planner",
        paragraphs: [
          "The main benchmark generates known graph shapes—layered, chain, fanout, and contention—and records complete run metadata. A 10,000-target layered graph with 19,800 edges plans in a 62.9–66.4 ms median range across independent repetitions on an M2 Pro running amd64 Go under Rosetta.",
          "Profiling showed duplicate target snapshots in the planner. Removing them cut allocations for that workload by about 18%, from roughly 220,223 to 180,352. The lesson was satisfyingly concrete: an asymptotically reasonable algorithm can still spend a great deal of time manufacturing short-lived structure.",
        ],
      },
      {
        heading: "The boundary I am keeping",
        paragraphs: [
          "This is a local build engine, not a distributed build system. Remote execution would introduce content-addressed storage, worker trust, scheduling, transport failure, and reproducibility questions. I want the local graph, cache, executor, and evidence to remain boringly correct before making that boundary larger.",
        ],
      },
    ],
  },
  {
    slug: "prompt-gate",
    name: "PromptGate",
    descriptor: "A prompt gateway on Cloudflare Workers and Durable Objects.",
    status: "working prototype",
    year: "2026",
    languages: ["TypeScript", "Workers", "Durable Objects"],
    repository: "https://github.com/Annsh-N/cf_ai_prompt_gate",
    summary:
      "Redacts secrets before inference, compiles noisy prompts, verifies important constraints, enforces per-user budgets, caches safe results, and reports what happened.",
    question: "What infrastructure belongs between raw user text and an expensive, external model call?",
    facts: [
      { label: "average token reduction", value: "33%" },
      { label: "raw synthetic leaks", value: "0" },
      { label: "tests", value: "21" },
      { label: "p95 cache hit", value: "0.75 ms" },
    ],
    sections: [
      {
        heading: "A gateway with a narrow job",
        paragraphs: [
          "PromptGate came from treating prompt preparation as infrastructure rather than a string helper inside every AI feature. The pipeline deterministically redacts common credentials and PII, normalizes repeated content, calls Workers AI only with sanitized text, verifies required constraints, redacts again before storage, and produces a token, cost, latency, cache, and redaction report.",
          "The key property is that raw secret patterns never need to cross the model boundary. A deterministic benchmark corpus fails if a synthetic secret reaches the captured AI request payload, which makes the security claim executable rather than decorative.",
        ],
      },
      {
        heading: "Per-user state without a central server",
        paragraphs: [
          "A Durable Object owns each user's budget, history, cache, and bearer-secret binding. The first valid secret is hashed and associated with the user; later calls with a different secret are rejected. Sanitized prompt hashes key the cache, allowing repeated requests to avoid inference while preserving the same reporting surface.",
          "The Worker router stays thin and the compile pipeline is separated from platform bindings, which makes failure paths testable: malformed model JSON, quota exhaustion, CORS preflight, missing users, cache hits, fallbacks, and post-model redaction all have focused coverage.",
        ],
      },
      {
        heading: "What the measurements mean",
        paragraphs: [
          "The current deterministic corpus is intentionally small: five cases, ten requests, 33% average token reduction, no failed requests, and no raw secret leaks. Cache-hit p95 is 0.75 ms and miss p95 is 4 ms in the local harness. These numbers validate the harness and pipeline behavior; they are not a claim about global production latency.",
        ],
      },
      {
        heading: "The interesting tradeoff",
        paragraphs: [
          "Compression can easily become semantic damage. PromptGate therefore treats constraints and preservation checks as part of compilation, not a best-effort cleanup. The project is most useful to me as a study of trust boundaries: deterministic code decides what a probabilistic system is allowed to see, and then verifies what it returns before the result is cached or exposed.",
        ],
      },
    ],
  },
  {
    slug: "alumni-dashboard",
    name: "Purdue CS Alumni Dashboard",
    descriptor: "An outcomes and data-management system for Purdue CS alumni data.",
    status: "team project",
    year: "2025",
    languages: ["React", "Node.js", "PostgreSQL", "D3"],
    repository: "https://github.com/Purdue-Stack/Purdue-CS-Alumni-Dashboard",
    summary:
      "A full-stack system for exploring alumni outcomes and for moving uploaded records through validation, review, and publication workflows.",
    question: "How do you make a large, inconsistent dataset useful without hiding the ingestion and privacy work behind the charts?",
    facts: [
      { label: "records", value: "3,000+ alumni" },
      { label: "primary store", value: "PostgreSQL" },
      { label: "ingestion", value: "preview · validate · commit" },
      { label: "output", value: "filtered analytics · CSV" },
    ],
    sections: [
      {
        heading: "The dashboard was the visible half",
        paragraphs: [
          "The obvious part of this project is the exploration UI: filters across graduation year, major, degree level, employment type, company, role, and geography feeding outcome, salary, placement, and graduate-school views. The more instructive part was upstream. Alumni data arrives with missing fields, duplicates, inconsistent labels, and privacy decisions that cannot be repaired by a chart component.",
          "We shaped the system around an upload-preview-commit path. An administrator can inspect parsed columns and row-level validation errors before any write, then commit valid records and receive inserted, updated, skipped, and failed counts. Administrative actions create logs so changes to the dataset are not invisible.",
        ],
      },
      {
        heading: "One contract across the stack",
        paragraphs: [
          "The React client talks to a Node API backed by PostgreSQL. Dashboard requests carry explicit filter parameters and receive chart-ready aggregates. Foundational read APIs expose alumni, internship, and mentor records with pagination and search. CSV exports reuse the same filter vocabulary so an exported report and an on-screen view can describe the same slice of data.",
          "This project made API shape feel less abstract. A filter is not just a dropdown; it becomes a query parameter contract, a database predicate, an aggregation decision, loading and error behavior, and eventually a reproducible report.",
        ],
      },
      {
        heading: "Privacy changes the design",
        paragraphs: [
          "Alumni profiles, compensation, contact information, and mentorship preferences do not all have the same visibility. The product model therefore separates ingestion from moderation and publication. Some of that workflow remains unfinished: the repository has the upload pipeline, live analytics, read APIs, mentorship persistence and approval endpoints, and CSV export, while richer profile moderation and the complete public directory still need work.",
        ],
      },
      {
        heading: "What I took from the project",
        paragraphs: [
          "Leading the work across several contributors taught me to care about interfaces that teams can independently implement and verify. The useful artifact is not simply a dashboard with many charts. It is the path from uncertain source data to a filtered answer, with validation and operational history visible along the way.",
        ],
      },
    ],
  },
];

export const notes: Note[] = [
  {
    slug: "bounded-queues-are-architecture",
    title: "A bounded queue is an architectural decision",
    date: "17 Aug 2026",
    readTime: "4 min",
    summary: "What a fixed-capacity worker queue says about ownership, overload, and shutdown in a network server.",
    paragraphs: [
      "It is easy to describe a worker queue as an implementation detail: the acceptor puts sockets in, workers take sockets out. The capacity changes the system. With W active workers and Q queue slots, the application can own at most W + Q + 1 client descriptors—the last descriptor may be held by an acceptor blocked while trying to dispatch it.",
      "That bound tells me where overload goes. When workers cannot keep up, the queue fills. The acceptor stops making progress, then the kernel listen backlog becomes the next waiting layer. The system has not eliminated load; it has chosen where the waiting is permitted and made application memory independent of the number of clients trying to connect.",
      "The same choice reaches shutdown. Closing the queue must wake producers and consumers. The acceptor must stop creating new ownership, accepted descriptors must either drain through workers or be deliberately rejected, and every worker must finish before the pool disappears. A queue API without close-and-wakeup semantics would make graceful shutdown a patchwork of special cases.",
      "This is why I now look at capacity alongside the data structure itself. An unbounded queue is often a decision to trade an immediate overload signal for delayed memory growth and tail latency. A bounded queue makes the limit visible, but it also forces the rest of the design to say what happens at that limit.",
    ],
  },
  {
    slug: "benchmark-the-queue-not-the-headline",
    title: "Benchmark the queue, not just the headline",
    date: "17 Aug 2026",
    readTime: "5 min",
    summary: "A throughput plateau taught me more about my HTTP server than its fastest requests-per-second number.",
    paragraphs: [
      "My HTTP server reaches roughly 24.4K small responses per second on an M2 Pro loopback test. That sentence is almost useless without the rest of the experiment: four workers, queue capacity 128, a 221-byte file, Release build, wrk on the same machine, three repeated ten-second runs after warmup, and zero socket or status errors.",
      "The more interesting result appears when offered concurrency rises. Throughput reaches its plateau around 16 connections and then barely changes at 64 and 256. p50 remains small, but p95 and p99 rise sharply. The extra connections are not producing useful work; they are spending longer waiting for the same four-worker execution width.",
      "That distinction changed the next engineering question. If I only kept the maximum requests-per-second row, I might reach for more concurrency machinery. The percentile table instead asks whether the worker count matches the workload, whether queue capacity is hiding overload for too long, and how the behavior changes on the deployment VPS rather than loopback.",
      "A benchmark is a model of a system under a chosen workload. I want the repository to preserve enough context to challenge that model later: commit, hardware, compiler, server configuration, load generator, timing boundaries, repetitions, percentiles, errors, and raw output. The result can then be wrong in a useful, reproducible way instead of merely sounding fast.",
    ],
  },
  {
    slug: "latest-wins-control",
    title: "Latest-wins control in a real-time stream",
    date: "19 Aug 2026",
    readTime: "5 min",
    summary: "Why some state changes should replace queued intent rather than wait their turn.",
    paragraphs: [
      "Suppose a voice workflow moves from collecting an account number to a postal code and then immediately to a verification code. The speech provider has acknowledged none of those changes yet. Treating each phase request as work in a FIFO would preserve arrival order while applying two configurations the workflow no longer wants.",
      "Listen Config separates desired, pending, and applied state. A provider operation already accepted by the ordered writer remains pending until acknowledgement. New workflow events replace the desired target. When the acknowledgement arrives, the runtime compares applied with the newest desired state and emits only the transition that is still relevant.",
      "Latest-wins is not permission to forget history everywhere. The pending operation still matters because its acknowledgement changes what the provider is known to have applied. A possibly-sent write matters even more: if the host cannot say whether it entered the socket, local state cannot safely infer remote state. The correct response is reconnect, not an optimistic retry that may reorder control.",
      "The design becomes useful when paired with an audio barrier. A configuration update and the audio that depends on it must enter the same ordered writer in control-first order. Once control is accepted there, the next audio chunk can proceed even while the provider acknowledgement is outstanding. The state machine is therefore not trying to make the network synchronous; it is making local ordering and uncertainty explicit.",
    ],
  },
];

export function getProject(slug: string) {
  return projects.find((project) => project.slug === slug);
}

export function getNote(slug: string) {
  return notes.find((note) => note.slug === slug);
}
