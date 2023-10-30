process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Promise Rejection:');
    console.error(reason); // Log the error reason
    console.error(promise); // Log the promise that was rejected
});