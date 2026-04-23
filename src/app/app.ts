import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Navbar } from './shared/navbar/navbar';
import { Footer } from './shared/footer/footer';
import { Chatbot } from './shared/chatbot/chatbot';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, Navbar, Footer, Chatbot],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  title = 'fashion-frontend';
}