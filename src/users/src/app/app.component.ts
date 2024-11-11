import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; // Importa FormsModule aquí


@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CommonModule, FormsModule],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  users: any[] = [];
  newUser: any = {
    id: 0,
    userName: '',
    password: '',
    name: '',
    lastName: '',
    email: '',
    isActive: true,
    creationDate: null,
    lastModifiedDate: null 
  };
  errorMessages: string[] = []; // Array para almacenar mensajes de error

  ngOnInit(): void {
    this.getUsers();
  }

  getUsers(): void {
    fetch('https://localhost:7266/api/user')
      .then(response => response.json())
      .then(data => {
        this.users = data;
      })
      .catch(error => console.error('Error fetching users:', error));
  }

  createUser(): void {
    // Asigna fechas actuales para `creationDate` y `lastModifiedDate`
    this.newUser.creationDate = new Date().toISOString();
   

    fetch('https://localhost:7266/api/user', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(this.newUser)
    })
    .then(response => {
      if (response.ok) {
        return response.json();
      } else {
        return response.json().then(errorResponse => {
          this.handleValidationErrors(errorResponse);
          throw new Error('Validation error');
        });
      }
    })
    .then(newUser => {
      this.users.push(newUser);
      this.clearForm();
      this.errorMessages = []; // Limpia los mensajes de error si la creación es exitosa
    })
    .catch(error => {
      if (error.message !== 'Validation error') {
        console.error('Error creating user:', error);
      }
    });
  }

  handleValidationErrors(errorResponse: any): void {
    this.errorMessages = [];
    if (errorResponse.errors) {
      // Recorre cada campo y agrega los mensajes de error a `errorMessages`
      for (const field in errorResponse.errors) {
        if (errorResponse.errors.hasOwnProperty(field)) {
          this.errorMessages.push(...errorResponse.errors[field]);
        }
      }
    }
  }

  clearForm(): void {
    this.newUser = {
      id: 0,
      userName: '',
      password: '',
      name: '',
      lastName: '',
      email: '',
      isActive: true,
      creationDate: new Date().toISOString(),
      lastModifiedDate: null
    };
  }
  
  updateUser(user: any): void {
  
    // Realiza la solicitud PUT a la API para actualizar el usuario
    fetch(`https://localhost:7266/api/user`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(user)
    })
    .then(response => {
      if (response.ok) {
        return response.json();
      } else {
        return response.json().then(errorResponse => {
          this.handleValidationErrors(errorResponse);
          throw new Error('Validation error');
        });
      }
    })
    .then(updatedUser => {
      const index = this.users.findIndex(u => u.id === updatedUser.id);
      if (index !== -1) {
        this.users[index] = updatedUser; // Actualiza el usuario en el arreglo
      }
      this.clearForm(); // Limpia el formulario
      this.errorMessages = []; // Limpia los mensajes de error si la actualizaciÃ³n es exitosa
    })
    .catch(error => {
      if (error.message !== 'Validation error') {
        console.error('Error updating user:', error);
      }
    });
  }

  selectUserForEdit(user: any): void {
    this.newUser = { ...user }; // Copia los datos del usuario seleccionado al formulario
  }

  deleteUser(userId: number): void {
    fetch(`https://localhost:7266/api/user/${userId}`, {
      method: 'DELETE'
    })
    .then(response => {
      if (response.ok) {
        // Si la eliminaciÃ³n fue exitosa, eliminamos el usuario de la lista local
        this.users = this.users.filter(user => user.id !== userId);
      } else {
        console.error('Error deleting user:', response.statusText);
      }
    })
    .catch(error => {
      console.error('Error deleting user:', error);
    });
  }
}
