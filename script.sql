CREATE TABLE IF NOT EXISTS User (
    user_id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(255) NOT NULL
);
CREATE TABLE IF NOT EXISTS Payment_details (
    account_number INT PRIMARY KEY,
    cvv INT NOT NULL
);
CREATE TABLE IF NOT EXISTS Tickets (
    ticket_id INT PRIMARY KEY AUTO_INCREMENT,
    ticket_type VARCHAR(255) NOT NULL,
    ticket_description VARCHAR(255) NOT NULL,
    quantity INT
);

CREATE TABLE IF NOT EXISTS Ticket_order (
    order_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    ticket_id INT NOT NULL,
    order_status varchar(255) NOT NULL,
    FOREIGN KEY (user_id) REFERENCES User(user_id),
    FOREIGN KEY (ticket_id) REFERENCES Tickets(ticket_id)
);

# some dummy values for all tables
INSERT INTO User (username) VALUES ('JohnDoe');
INSERT INTO User (username) VALUES ('JohnDoe2');
INSERT INTO User (username) VALUES ('JohnDoe3');
INSERT INTO User (username) VALUES ('JohnDoe4');
INSERT INTO User (username) VALUES ('JohnDoe5');

INSERT INTO Payment_details (account_number, cvv) VALUES (987654321, 789);

INSERT INTO Tickets (ticket_type, ticket_description, quantity) VALUES ('Concert', 'Front Row', 20);
INSERT INTO Tickets (ticket_type, ticket_description, quantity) VALUES ('Concert', 'Backstage', 2);


